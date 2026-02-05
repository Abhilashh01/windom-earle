import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

export const stripe =
	process.env.STRIPE_SECRET_KEY?.length > 0
		? new Stripe(process.env.STRIPE_SECRET_KEY)
		: null;
