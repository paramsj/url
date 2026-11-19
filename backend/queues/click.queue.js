import { Queue } from "bullmq";
import { redisConnection } from "../db/redis.js";

export const clickQueue = new Queue('click-queue',{
    connection : redisConnection,
})