import "dotenv/config";
import { Worker } from "bullmq";
import { eq, sql } from "drizzle-orm";

import { db } from "../db/db.js";
import { redisConnection } from "../db/redis.js";
import { shortLinks, clickEvents } from "../db/schema.js";

const worker = new Worker(
  "click-queue",
  async (job) => {
    const { shortLinkId, ipAddress, userAgent, referrer } = job.data;

    await db
      .update(shortLinks)
      .set({
        totalClicks: sql`${shortLinks.totalClicks} + 1`,
      })
      .where(eq(shortLinks.id, shortLinkId));

    await db.insert(clickEvents).values({
      shortLinkId,
      ipAddress,
      userAgent,
      referrer,
    });
  },
  {
    connection: redisConnection,
  }
);

worker.on("completed", (job) => {
  console.log(`Click job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Click job failed: ${job?.id}`, err);
});

console.log("Click worker successfully started and listening to click-queue...");