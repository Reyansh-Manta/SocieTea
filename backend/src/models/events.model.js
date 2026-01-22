import mongoose from "mongoose";
import { Schema } from "mongoose";

const eventSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        description: {
            type: String
        },
        college: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "College"
        },
        org: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "Org"
        },
        mode: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Online"
        },
        location: {
            type: String
        },
        members: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        poster: {
            type: String
        },
        RSVP: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        attendees: {
            type: Array,
            of: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

export const Event = mongoose.model("Event", eventSchema);
