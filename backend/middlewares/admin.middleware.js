import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized: user not authenticated");
  }

  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Forbidden: admin access required");
  }

  next();
});

export { verifyAdmin };