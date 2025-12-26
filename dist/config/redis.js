"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.redisConnection = void 0;
const ioredis_1 = require("ioredis");
const redis_1 = require("@upstash/redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
// TCP connection for BullMQ
// Production: Upstash Redis (TCP)
// Development: Local Redis
const redisUrl = isProduction
    ? process.env.UPSTASH_REDIS_URL
    : "redis://localhost:6379";
exports.redisConnection = new ioredis_1.Redis(redisUrl, {
    maxRetriesPerRequest: null,
});
exports.redisConnection.on("connect", () => {
    console.log(`📡 Connected to Redis (${isProduction ? "Upstash" : "Local"})`);
});
exports.redisConnection.on("error", (err) => {
    console.error("Redis connection error:", err);
});
// HTTP-based Redis client (Upstash only - for production serverless operations)
exports.redis = isProduction
    ? new redis_1.Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;
// Default export for BullMQ compatibility
exports.default = exports.redisConnection;
//# sourceMappingURL=redis.js.map