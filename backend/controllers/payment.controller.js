import crypto from "crypto";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { getRazorpay } from "../lib/razorpay.js";

export const createCheckoutSession = async (req, res) => {
	const razorpay = getRazorpay();
	if (!razorpay) {
		return res.status(503).json({ error: "Razorpay is not configured" });
	}
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;
		for (const product of products) {
			const amount = Math.round(product.price * 100);
			totalAmount += amount * (product.quantity || 1);
		}

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		if (totalAmount <= 0) {
			return res.status(400).json({ error: "Invalid total amount" });
		}

		const currency = process.env.RAZORPAY_CURRENCY || "INR";
		const shortReceipt = `ord_${Date.now().toString(36).slice(-6)}_${req.user._id
			.toString()
			.slice(-6)}`;
		const razorpayOrder = await razorpay.orders.create({
			amount: totalAmount,
			currency,
			receipt: shortReceipt,
			notes: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({
			orderId: razorpayOrder.id,
			amount: totalAmount,
			currency,
			keyId: process.env.RAZORPAY_KEY_ID,
		});
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const verifyPayment = async (req, res) => {
	try {
		const razorpay = getRazorpay();
		if (!razorpay) {
			return res.status(503).json({ error: "Razorpay is not configured" });
		}

		if (!process.env.RAZORPAY_KEY_SECRET) {
			return res.status(503).json({ error: "Razorpay is not configured" });
		}

		const { razorpay_order_id, razorpay_payment_id, razorpay_signature, products, couponCode } =
			req.body;

		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return res.status(400).json({ error: "Missing Razorpay payment details" });
		}

		const body = `${razorpay_order_id}|${razorpay_payment_id}`;
		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(body)
			.digest("hex");

		if (expectedSignature !== razorpay_signature) {
			return res.status(400).json({ error: "Invalid payment signature" });
		}

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				await Coupon.findOneAndUpdate(
					{ code: couponCode, userId: req.user._id },
					{ isActive: false }
				);
			}
		}

		const productsForOrder = Array.isArray(products) ? products : [];
		const totalAmount = productsForOrder.reduce((sum, product) => {
			const price = Number(product.price || 0);
			const quantity = Number(product.quantity || 1);
			return sum + Math.round(price * 100) * quantity;
		}, 0);

		const discountedAmount =
			coupon && totalAmount > 0
				? totalAmount - Math.round((totalAmount * coupon.discountPercentage) / 100)
				: totalAmount;

		const newOrder = new Order({
			user: req.user._id,
			products: productsForOrder.map((product) => ({
				product: product._id || product.id,
				quantity: product.quantity,
				price: product.price,
			})),
			totalAmount: discountedAmount / 100,
			razorpayOrderId: razorpay_order_id,
			razorpayPaymentId: razorpay_payment_id,
		});

		await newOrder.save();

		res.status(200).json({
			success: true,
			message: "Payment verified and order created.",
			orderId: newOrder._id,
		});
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
