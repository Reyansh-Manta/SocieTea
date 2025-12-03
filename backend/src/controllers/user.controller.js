import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"; 
import {googleClient} from "../utils/googleClient.js";

const googleAuth = asyncHandler(async (req, res) => {
    const {id_token} = req.body;
    if(!id_token){
        throw new ApiError(401 ,"ID token is required");
    }
    const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload();
    if(!payload){
        throw new ApiError(401, "Invalid ID token");
    }
    const email = payload.email;
    const fullName = payload.name;
    const profilePic = payload.picture;

    return res
        .status(200)
        .json(new ApiResponse(200, {email, fullName, profilePic}, "GoogleAuth Successful"))
})