import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        Department: {
            type: String
        },
        levelORyear: {
            type: String
        },
        Organization: {
            type: String
        },
        Societies: {
            type: Array,
            default: []
        },
        profilePic: {
            type: String
        },
        refreshToken: {
            type: String
        },
        FullyRegistered: {
            type: String,
            default: false
        }
    },
    { timestamps: true }
)

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        }, process.env.JWT_RT_SECRET, {
        expiresIn: process.env.JWT_RT_EXPIRES_IN
    })
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        }, process.env.JWT_AT_SECRET, {
        expiresIn: process.env.JWT_AT_EXPIRES_IN
    })
}

export const User = mongoose.model("User", userSchema);
