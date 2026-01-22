import { User } from "../models/user.model.js"
import { ApiError } from "./ApiError.js"

const generateTokens = async(userId) => {    
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
    
        return {refreshToken, accessToken}
    }
    catch (error) {
        throw new ApiError(500, "Error generating Access and Refresh tokens")
    }
}

export {generateTokens}