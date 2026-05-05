import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "../db/db.js";
import { users, refreshTokens } from "../db/schema.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { hashToken } from "../utils/hashToken.js";


const createShortLink = asyncHandler(async(req,res,next)=>{

});

const getAllLinks = asyncHandler(async(req,res,next)=>{
    
});

export { createShortLink , getAllLinks};