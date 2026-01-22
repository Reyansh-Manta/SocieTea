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
        emailFormats: {
            type: [String],
            default: []
        },
        profilePic: {
            type: String
        },
        orgs: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "Org"
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
