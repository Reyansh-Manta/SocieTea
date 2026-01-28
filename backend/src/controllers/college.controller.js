import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { College } from "../models/college.model.js";
import { Org } from "../models/orgs.model.js"; // Ensure Org schema is registered
import { importCollegesFromCSV } from "../utils/importColleges.js";

const feedAllCollegeData = asyncHandler(async (req, res) => {
    const result = await importCollegesFromCSV();
    return res.status(200).json(
        new ApiResponse(200, result, "Colleges imported successfully")
    );
})

const smailcheck = asyncHandler(async (req, res) => {
    const { college_nameid } = req.body;
    const college = await College.findById(college_nameid);
    if (college.emailFormat) {
        return res.status(200).json(
            new ApiResponse(200, college.emailFormat, "Email format found")
        );
    }
    else {
        return res.status(200).json(
            new ApiResponse(200, null, "Email format not found")
        );
    }
})

const addSmailFormat = asyncHandler(async (req, res) => {
    const { college_nameid, emailFormat } = req.body;
    const college = await College.findById(college_nameid);
    if (college) {
        college.emailFormat = emailFormat;
        await college.save();
        return res.status(200).json(
            new ApiResponse(200, college, "Email format added successfully")
        );
    }
    else {
        return res.status(200).json(
            new ApiResponse(200, null, "College not found")
        );
    }
})

const getColleges = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 21 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search) {
        // Use word boundary \b to match start of words (e.g. "ind" matches "India" but not "Bathinda")
        // Escape special regex characters to prevent errors
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query = {
            $or: [
                { name: { $regex: `\\b${safeSearch}`, $options: "i" } },
                { location: { $regex: `\\b${safeSearch}`, $options: "i" } }
            ]
        };
    }

    const colleges = await College.find(query)
        .skip(skip)
        .limit(limitNum)
        .select("name location _id emailFormats");

    return res.status(200).json(
        new ApiResponse(200, colleges, "Colleges fetched successfully")
    );
});

const submitEmailFormat = asyncHandler(async (req, res) => {
    const { college_nameid, emailFormat } = req.body;
    const college = await College.findById(college_nameid);

    if (college) {
        // Initialize array if it doesn't exist
        if (!college.emailFormats) {
            college.emailFormats = [];
        }

        // Check if format already exists
        const existsInArray = college.emailFormats.includes(emailFormat);

        if (existsInArray) {
            return res.status(200).json(
                new ApiResponse(200, college, "Email format already exists")
            );
        }

        // Add to array
        college.emailFormats.push(emailFormat);
        await college.save();

        return res.status(200).json(
            new ApiResponse(200, college, "Email format added successfully")
        );
    }
    else {
        return res.status(200).json(
            new ApiResponse(200, null, "College not found")
        );
    }
})

const getCollegeOrgs = asyncHandler(async (req, res) => {
    // console.log("codereachedhere");
    const { college_nameid } = req.body;

    const college = await College.findById(college_nameid).populate("orgs");

    if (college) {
        return res.status(200).json(
            new ApiResponse(200, college.orgs, "College Orgs Fetched Successfully")
        );
    }
    else {
        return res.status(404).json(
            new ApiResponse(404, null, "College not found")
        );
    }
})

export {
    feedAllCollegeData,
    smailcheck,
    addSmailFormat,
    getColleges,
    submitEmailFormat,
    getCollegeOrgs
}