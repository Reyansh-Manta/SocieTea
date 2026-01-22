import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Error accessing token")
        }

        const decoded = jwt.verify(token, process.env.JWT_AT_SECRET)

        const user = await User.findById(decoded._id)
        if (!user) {
            throw new ApiError(401, "User not found")
        }
        req.user = user
        console.log(user);

        next()
    } catch (error) {

        console.log(error);

        throw new ApiError(401, error.message || "Invalid token")
    }
})

