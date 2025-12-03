import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTokens } from "../utils/generateTokens.js";
import { googleClient } from "../utils/googleClient.js";

const googleAuth = asyncHandler(async (req, res) => {
    const { id_token } = req.body;
    if (!id_token) {
        throw new ApiError(401, "ID token is required");
    }
    const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload();
    if (!payload) {
        throw new ApiError(401, "Invalid ID token");
    }
    const email = payload.email;
    const fullName = payload.name;
    const profilePic = payload.picture;
    const emailVerified = payload.emailVerified

    if (!emailVerified) {
        throw new ApiError(401, "Email not verified via googleAuth")
    }

    let user;

    const existingUser = await User.findOne({ email })

    if (existingUser) {
        user = existingUser
    }
    else {
        user = await User.create({
            email,
            fullName,
            profilePic: profilePic || ""
        })
    }

    const {refreshToken, accessToken} = generateTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, user, "GoogleAuth Successful"))
})

export {
    googleAuth
}