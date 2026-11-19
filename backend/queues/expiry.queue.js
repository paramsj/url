import { Queue } from "bullmq";
import { redisConnection } from "../db/redis.js";

export const expiryQueue = new Queue("expiry-queue", {
  connection: redisConnection,
});
