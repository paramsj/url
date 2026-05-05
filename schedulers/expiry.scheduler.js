import "dotenv/config";
import { expiryQueue } from "../queues/expiry.queue.js";

await expiryQueue.upsertJobScheduler(
  "expire-links-every-5-mins",
  {
    every: 5 * 60 * 1000,
  },
  {
    name: "expire-links",
    data: {},
    opts: {
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: false,
    },
  }
);

console.log("Expiry scheduler registered");
process.exit(0);