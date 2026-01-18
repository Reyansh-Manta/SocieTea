import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTokens } from "../utils/generateTokens.js";
import { googleClient } from "../utils/googleClient.js";

const googleAuth = asyncHandler(async (req, res) => {
    const { id_token, emailFormat, organization } = req.body;
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
    const emailVerified = payload.email_verified

    if (!emailVerified) {
        return res.status(401).json(new ApiResponse(401, null, "Email not verified via googleAuth"));
    }

    let user;

    const existingUser = await User.findOne({ email })

    if (organization) {
        // Validate email format ONLY for New User / partial profiles
        // If user already exists AND has an Organization, we assume they are verified/legacy and skip this check.
        const isVerifiedUser = existingUser && existingUser.Organization;

        if (!isVerifiedUser && emailFormat) {
            const expectedDomain = emailFormat.startsWith("@") ? emailFormat : `@${emailFormat}`;
            if (!email.toLowerCase().endsWith(expectedDomain.toLowerCase())) {
                if (existingUser && !existingUser.Organization) {
                    return res.status(401).json(new ApiResponse(401, null, "This email doesn't belong to an existing user. Please sign up with us as a new user"));
                }
                return res.status(401).json(new ApiResponse(401, null, `Email must end with ${expectedDomain} to bypass restriction`));
            }
        }

        // Path 1: New User (via College Selection) OR Existing User joining/updating Org
        if (existingUser) {
            user = existingUser;
            // Update organization if not set
            if (!user.Organization) {
                user.Organization = organization;
                await user.save();
            }
        } else {
            user = await User.create({
                username: email.split("@")[0],
                email,
                fullName,
                profilePic: profilePic || "",
                Organization: organization
            })
        }
    } else {
        // Path 2: Existing User (Direct Login)
        // Must check if user exists AND has organization
        if (!existingUser) {
            return res.status(401).json(new ApiResponse(401, null, "This email doesn't belong to an existing user. Please sign up with us as a new user"));
        }

        if (!existingUser.Organization) {
            return res.status(401).json(new ApiResponse(401, null, "This email doesn't belong to an existing user. Please sign up with us as a new user"));
        }

        user = existingUser;
    }
    // console.log(user._id);

    const { refreshToken, accessToken } = generateTokens(user._id)

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

const registerUser = asyncHandler(async (req, res) => {
    const { username, levelORyear, Department, Organization } = req.body
    if (!username || !levelORyear || !Department || !Organization) {
        throw new ApiError(400, "All fields are required")
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
        throw new ApiError(400, "Username or email already exists")
    }
    const user = await User.findOneAndUpdate({ email },
        {
            $set: {
                username,
                levelORyear,
                Department,
                Organization,
                FullyRegistered: true
            }
        },
        { new: true }
    )
    if (!user) {
        throw new ApiError(400, "Error while registering user")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User Registered Successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})

export {
    googleAuth,
    registerUser,
    logoutUser
}