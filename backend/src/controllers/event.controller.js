import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/events.model.js";
import { Org } from "../models/orgs.model.js";
import { College } from "../models/college.model.js";

const createEvent = asyncHandler(async (req, res) => {
    const { name, description, mode, location, poster, orgId, startDate, endDate } = req.body;

    if (!name || !description || !mode || !orgId || !startDate || !endDate) {
        throw new ApiError(400, "Name, description, mode, organization, start date, and end date are required");
    }

    if (new Date(startDate) >= new Date(endDate)) {
        throw new ApiError(400, "End date must be after start date");
    }

    const org = await Org.findById(orgId);
    if (!org) {
        throw new ApiError(404, "Organization not found");
    }

    // Check if user is admin of the organization
    const isAdmin = org.admin.some(adminId => adminId.toString() === req.user._id.toString());
    if (!isAdmin) {
        throw new ApiError(403, "You are not authorized to create events for this organization");
    }

    const event = await Event.create({
        name,
        description,
        mode,
        location: mode === "Offline" ? location : "Online",
        poster,
        startDate,
        endDate,
        org: [org._id],
        college: [org.college], // Assuming org has a college field
    });

    if (!event) {
        throw new ApiError(500, "Something went wrong while creating the event");
    }

    // Update Org with new event
    await Org.findByIdAndUpdate(
        org._id,
        {
            $push: { events: event._id }
        },
        { new: true }
    );

    return res.status(201).json(
        new ApiResponse(201, event, "Event created successfully")
    );
});


const getOrgEvents = asyncHandler(async (req, res) => {
    const { orgId } = req.body;
    if (!orgId) {
        throw new ApiError(400, "Org ID is required");
    }
    const events = await Event.find({ org: orgId }).sort({ startDate: 1 });
    return res.status(200).json(new ApiResponse(200, events, "Events fetched successfully"));
});

export {
    createEvent,
    getOrgEvents
}
