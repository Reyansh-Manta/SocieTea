import mongoose from "mongoose";
import { Schema } from "mongoose";

const orgSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        profilePic: {
            type: String
        },
        college: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "College"
        },
        Description: {
            type: String
        },
        events: {
            type: Array
        },
        members: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        admin: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

export const Org = mongoose.model("Org", orgSchema);
