import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js"

export const verifyJWT = ()=> {
    return asyncHandler(async(req,_,next)=> {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
            if(!token){
                throw new ApiError(404,"Unauth req")
            }
            const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
            req.user = user;
            next()  
    })
}
