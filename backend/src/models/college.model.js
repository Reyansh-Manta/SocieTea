import mongoose from "mongoose";
import { Schema } from "mongoose";

const collegeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        emailFormat: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        profilePic: {
            type: String
        },
        orgs: {
            type: Array
        },
        location: {
            type: String
        },
        members: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

export const College = mongoose.model("College", collegeSchema);
