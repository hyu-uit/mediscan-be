import { Redis as IORedis } from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";
export declare const redisConnection: IORedis;
export declare const redis: UpstashRedis | null;
export default redisConnection;
//# sourceMappingURL=redis.d.ts.map