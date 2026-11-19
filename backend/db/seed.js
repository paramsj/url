import dotenv from "dotenv";
dotenv.config();

import { db, client } from "./db.js";
import { idRanges } from "./schema.js";

const DEFAULT_RANGES = [
  {
    serverId: "app1",
    startId: 1000000,
    endId: 10000000,
    nextId: 1000000,
    isActive: true,
  },
  {
    serverId: "app2",
    startId: 10000001,
    endId: 20000000,
    nextId: 10000001,
    isActive: true,
  },
  {
    serverId: "app3",
    startId: 20000001,
    endId: 30000000,
    nextId: 20000001,
    isActive: true,
  },
];

async function seedIdRanges() {
  console.log("Seeding ID ranges for server instances...");

  try {
    for (const range of DEFAULT_RANGES) {
      await db
        .insert(idRanges)
        .values(range)
        .onConflictDoNothing({ target: idRanges.serverId });

      console.log(
        `✓ Range configured for ${range.serverId}: [${range.startId} - ${range.endId}]`
      );
    }

    console.log("ID ranges seeding completed successfully.");
  } catch (error) {
    console.error("Failed to seed ID ranges:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedIdRanges();
