import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../db/db.js";
import { users } from "../db/schema.js";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token");
    }

    throw new ApiError(401, "Unauthorized");
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, decoded.id))
    .limit(1);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive");
  }

  req.user = user;

  next();
});

export { verifyJWT };