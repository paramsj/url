import "dotenv/config";
import { Worker } from "bullmq";
import { and, eq, lt } from "drizzle-orm";

import { db } from "../db/db.js";
import { redisConnection } from "../db/redis.js";
import { shortLinks } from "../db/schema.js";

const worker = new Worker(
  "expiry-queue",
  async (job) => {
    if (job.name !== "expire-links") return;

    const expiredLinks = await db
      .select({
        id: shortLinks.id,
        shortCode: shortLinks.shortCode,
      })
      .from(shortLinks)
      .where(
        and(
          eq(shortLinks.isActive, true),
          lt(shortLinks.expiresAt, new Date())
        )
      );

    for (const link of expiredLinks) {
      await redisConnection.del(`short:${link.shortCode}`);
    }

    await db
      .update(shortLinks)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(shortLinks.isActive, true),
          lt(shortLinks.expiresAt, new Date())
        )
      );

    console.log(`Expired ${expiredLinks.length} links`);
  },
  {
    connection: redisConnection,
  }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.name}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job?.name}`, err);
});

console.log("Expiry worker successfully started and listening to expiry-queue...");