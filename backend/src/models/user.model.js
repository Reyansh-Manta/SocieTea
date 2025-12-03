import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
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
            type: String,
            required: true
        },
        levelORyear: {
            type: String,
            required: true
        },
        Organization: {
            type: String,
            required: true
        },
        profilePic: {
            type: String
        }
    },
    { timestamps: true }
)

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        }, process.env.JWT_RT_SECRET, {
        expiresIn: process.env.JWT_RT_EXPIRES_IN
    })
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
            Organization: this.Organization
        }, process.env.JWT_AT_SECRET, {
        expiresIn: process.env.JWT_AT_EXPIRES_IN
    })
}

export const User = mongoose.model("User", userSchema);
