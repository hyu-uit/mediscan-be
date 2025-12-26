import { Redis as IORedis } from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// TCP connection for BullMQ
// Production: Upstash Redis (TCP)
// Development: Local Redis
const redisUrl = isProduction
  ? process.env.UPSTASH_REDIS_URL!
  : "redis://localhost:6379";

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log(`📡 Connected to Redis (${isProduction ? "Upstash" : "Local"})`);
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// HTTP-based Redis client (Upstash only - for production serverless operations)
export const redis = isProduction
  ? new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Default export for BullMQ compatibility
export default redisConnection;
