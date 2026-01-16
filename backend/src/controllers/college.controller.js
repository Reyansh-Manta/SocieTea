import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { College } from "../models/college.model.js";
import { importCollegesFromCSV } from "../utils/importColleges.js";

const feedAllCollegeData = asyncHandler(async (req, res) => {
    try {
        const result = await importCollegesFromCSV();
        return res.status(200).json(
            new ApiResponse(200, result, "Colleges imported successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to import colleges");
    }
})

export { feedAllCollegeData }