import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis = null;

try {
	if (process.env.UPSTASH_REDIS_URL) {
		redis = new Redis(process.env.UPSTASH_REDIS_URL, {
			lazyConnect: true,
			maxRetriesPerRequest: null,      // ✅ important for Upstash
			enableReadyCheck: false          // ✅ skip unsupported Redis INFO check
		});

		redis.connect()
			.then(() => console.log("✅ Redis connected"))
			.catch((err) => {
				console.error("❌ Redis connection failed:", err.message);
				redis = null;
			});
	}
} catch (err) {
	console.error("❌ Failed to initialize Redis:", err.message);
	redis = null;
}

export { redis };

