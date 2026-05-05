import { and, eq, lte, sql } from "drizzle-orm";

import { db } from "../db/db.js";
import { idRanges, shortLinks , clickEvents} from "../db/schema.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { encodeBase62 } from "../utils/encoder.js";

import { redisConnection } from "../db/redis.js";


const getNextIdForServer = async () => {
  const serverId = process.env.SERVER_ID;

  if (!serverId) {
    throw new ApiError(500, "SERVER_ID is not configured");
  }

  const [range] = await db
    .update(idRanges)
    .set({
      nextId: sql`${idRanges.nextId} + 1`,
    })
    .where(
      and(
        eq(idRanges.serverId, serverId),
        eq(idRanges.isActive, true),
        lte(idRanges.nextId, idRanges.endId)
      )
    )
    .returning({
      allocatedId: sql`${idRanges.nextId} - 1`,
    });

  if (!range) {
    throw new ApiError(500, "ID range exhausted or server range not found");
  }

  return Number(range.allocatedId);
};

const createShortLink = asyncHandler(async (req, res) => {
  const { originalUrl, title, expiresAt } = req.body;

  if (!originalUrl) {
    throw new ApiError(400, "Original URL is required");
  }

  const allocatedId = await getNextIdForServer();
  const shortCode = encodeBase62(allocatedId);

  const [createdLink] = await db
    .insert(shortLinks)
    .values({
      userId: req.user.id,
      originalUrl,
      shortCode,
      title: title || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning();

  await redisConnection.set(
    `short:${shortCode}`,
    originalUrl,
    "EX",
    60 * 60
  );
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        link: createdLink,
        serverId: process.env.SERVER_ID,
        allocatedId,
        shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      },
      "Short link created successfully"
    )
  );
});

const getAllLinks = asyncHandler(async (req, res) => {
  const links = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.userId, req.user.id));

  return res
    .status(200)
    .json(new ApiResponse(200, links, "Links fetched successfully"));
});

const redirectToOriginalUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  if (!shortCode) {
    throw new ApiError(400, "Short code is required");
  }

  const cacheKey = `short:${shortCode}`;

  const cachedUrl = await redisConnection.get(cacheKey);

  if (cachedUrl) {
    await db
      .update(shortLinks)
      .set({
        totalClicks: sql`${shortLinks.totalClicks} + 1`,
      })
      .where(eq(shortLinks.shortCode, shortCode));

    return res.redirect(302, cachedUrl);
  }

  const [link] = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.shortCode, shortCode))
    .limit(1);

  if (!link) {
    throw new ApiError(404, "Short link not found");
  }

  if (!link.isActive) {
    throw new ApiError(403, "Link is disabled");
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    throw new ApiError(403, "Link has expired");
  }

  await redisConnection.set(cacheKey, link.originalUrl, "EX", 60 * 60);

  await db
    .update(shortLinks)
    .set({
      totalClicks: sql`${shortLinks.totalClicks} + 1`,
    })
    .where(eq(shortLinks.id, link.id));

  await db.insert(clickEvents).values({
    shortLinkId: link.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || null,
    referrer: req.headers["referer"] || null,
  });

  return res.redirect(302, link.originalUrl);
});

const getLinkStats = asyncHandler(async(req,res)=>{
  const {id} = req.params;

  const [link] = await db.select().from(shortLinks).where(eq(shortLinks.id,id)).limit(1);

   if (!link) {
    throw new ApiError(404, "Link not found");
  }

  if (link.userId !== req.user.id) {
    throw new ApiError(403, "Not authorized to view this link");
  }

  const clicks = await db.select().from(clickEvents).where(eq(clickEvents.shortLinkId,id));

  return res.status(200).json(
    new ApiResponse(200,{
      totalClicks : link.totalClicks,
      clicks,
  },"Stats have been fetched!"));

});

export { createShortLink, getAllLinks, redirectToOriginalUrl , getLinkStats};