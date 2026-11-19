import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getHealth = asyncHandler(async(req,res,next)=>{
    return res.status(200).json(new ApiResponse(200,{
        serverId: process.env.SERVER_ID,
        port: process.env.PORT,
        uptime: process.uptime(),
    },
    "This one seems to be working!"))
});

export {getHealth};
