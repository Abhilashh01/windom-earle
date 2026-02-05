import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./backend/models/product.model.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Slim Fit Blue Jeans",
    description: "Classic slim fit jeans with a faded wash and durable denim fabric.",
    price: 59,
    image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT_GCsLv0I3J5nK3_9hpjoZNSaRfBdGfWkrUp3VvhPhxJ8hP5_O28fAP_O5vlMlIrVUX0d4dze6UAKzYg2XOf2A0VrUMhyqppRVULtBSR4",
    category: "jeans",
    isFeatured: true,
  },
  {
    name: "White Cotton T-Shirt",
    description: "Basic crew neck t-shirt made from 100% organic cotton.",
    price: 19,
    image: "data:image/jpeg;base64,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",
    category: "t-shirts",
    isFeatured: false,
  },
  {
    name: "Running Shoes",
    description: "Lightweight and breathable shoes designed for runners.",
    price: 89,
    image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT-lpDtpPcBTi8HCyUed3d4SfISb5h1cA7czCZtUhC8JPSAQukSv8mBaSdaloUB0bhXk-EYxI2hwVQlL-dh5ay6d5NXAxnu_pdede9rZofKdx7pZfRKWRgIDQ",
    category: "shoes",
  },
  {
    name: "Sunglasses",
    description: "Polarized sunglasses with UV protection for sunny days.",
    price: 49,
    image: "https://m.media-amazon.com/images/I/51wwVl2r-WL.jpg",
    category: "glasses",
  },
  {
    name: "Leather Jacket",
    description: "Premium leather jacket with a modern cut and zipper pockets.",
    price: 199,
    image: "https://wear.style/cdn/shop/products/product-image-1198564609.jpg?v=1628972374&width=1445",
    category: "jackets",
    isFeatured: true,
  },
  {
    name: "Formal Suit",
    description: "Two-piece formal suit tailored for business and formal events.",
    price: 299,
    image: "https://blackberrys.com/cdn/shop/files/2_Pcs_Suit_In_Khaki_Juttex-CPPM1708K1BA23FL-image1.jpg?v=1697877595",
    category: "suits",
  },
  {
    name: "Travel Backpack",
    description: "Spacious and durable backpack with multiple compartments.",
    price: 69,
    image: "https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1733351688-lululemon-6750d8fd169b2.jpg?crop=1.00xw:1.00xh;0,0&resize=980:*",
    category: "bags",
    isFeatured: false,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany(); // optional: clear previous products
    await Product.insertMany(sampleProducts);
    console.log("✅ Sample products inserted!");
    process.exit();
  } catch (error) {
    console.error("❌ Error inserting products:", error.message);
    process.exit(1);
  }
};

seedProducts();
