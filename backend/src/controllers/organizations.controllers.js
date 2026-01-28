import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Org } from "../models/orgs.model.js";
import { College } from "../models/college.model.js";
import { User } from "../models/user.model.js";

const createOrg = asyncHandler(async (req, res) => {
    const { name, Description, profilePic } = req.body;
    const user = req.user;

    if (!name) {
        throw new ApiError(400, "Organization name is required");
    }

    if (!Description) {
        throw new ApiError(400, "Organization description is required");
    }

    // Find College. 
    let college;

    if (user.OrganizationId) {
        college = await College.findById(user.OrganizationId);
    } else {
        // Prefer using the user's Organization name/ID if set.
        // If not set, check if collegeId is provided in body (optional fallback).
        let collegeNameOrId = user.Organization;
        if (!collegeNameOrId && req.body.collegeId) {
            collegeNameOrId = req.body.collegeId;
        }

        if (!collegeNameOrId) {
            throw new ApiError(400, "You must be part of a college to create an organization.");
        }

        college = await College.findOne({
            $or: [
                { name: collegeNameOrId },
                { _id: collegeNameOrId.match(/^[0-9a-fA-F]{24}$/) ? collegeNameOrId : null }
            ]
        });
    }

    if (!college) {
        throw new ApiError(404, "College not found");
    }

    // Check if org with same name exists in this college
    const existingOrg = await Org.findOne({ name, college: college._id });
    if (existingOrg) {
        throw new ApiError(409, "Organization with this name already exists in this college");
    }

    const org = await Org.create({
        name,
        Description: Description || "",
        profilePic: profilePic || "", // Optional
        college: college._id,
        admin: [user._id],
        members: [user._id]
    });

    // Add Org to College
    college.orgs.push(org._id);
    await college.save();

    // Add Org to User's Societies (assuming this tracks memberships/ownerships)
    // Using $push for atomicity, though user object is in memory
    await User.findByIdAndUpdate(user._id, {
        $addToSet: { Societies: org._id } // Use addToSet to avoid duplicates
    });

    return res.status(201).json(
        new ApiResponse(201, org, "Organization created successfully")
    );
});

const addOrgAdmin = asyncHandler(async (req, res) => {
    const { orgId, newAdminId } = req.body;
    const user = req.user;

    if (!orgId || !newAdminId) {
        throw new ApiError(400, "Organization ID and New Admin ID are required");
    }

    const org = await Org.findById(orgId);
    if (!org) {
        throw new ApiError(404, "Organization not found");
    }

    // Check if current user is an admin
    const isAdmin = org.admin.some(adminId => adminId.toString() === user._id.toString());
    if (!isAdmin) {
        throw new ApiError(403, "You are not authorized to add admins to this organization");
    }

    // Check if new admin exists
    const newAdmin = await User.findById(newAdminId);
    if (!newAdmin) {
        throw new ApiError(404, "User to be added as admin not found");
    }

    // Add new admin
    if (!org.admin.includes(newAdminId)) {
        org.admin.push(newAdminId);
        await org.save();
    }

    // Ensure new admin is also a member? (Optional but logical)
    if (!org.members.includes(newAdminId)) {
        org.members.push(newAdminId);
        await org.save();
    }

    return res.status(200).json(
        new ApiResponse(200, org, "Admin added successfully")
    );
});

const toggleOrgMembership = asyncHandler(async (req, res) => {
    const { orgId } = req.body;
    const user = req.user;

    if (!orgId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const org = await Org.findById(orgId);
    if (!org) {
        throw new ApiError(404, "Organization not found");
    }

    const userIdStr = user._id.toString();
    // Check if user is already a member
    // Note: members array stores ObjectIds
    const isMember = org.members.some(id => id.toString() === userIdStr);

    if (isMember) {
        // LEAVE ORG
        // Constraint: If user is the ONLY member, they cannot leave (must delete org)
        if (org.members.length <= 1) {
            throw new ApiError(400, "You are the only member. You cannot leave the organization; you must delete it.");
        }

        // Remove from Org members
        org.members = org.members.filter(id => id.toString() !== userIdStr);

        // If user is Admin, remove from Admin list as well
        if (org.admin && org.admin.some(id => id.toString() === userIdStr)) {
            org.admin = org.admin.filter(id => id.toString() !== userIdStr);
        }

        await org.save();

        // Remove from User Societies
        await User.findByIdAndUpdate(user._id, {
            $pull: { Societies: org._id }
        });

        return res.status(200).json(
            new ApiResponse(200, { isMember: false }, "Left organization successfully")
        );
    } else {
        // JOIN ORG
        org.members.push(user._id);
        await org.save();

        await User.findByIdAndUpdate(user._id, {
            $addToSet: { Societies: org._id }
        });

        return res.status(200).json(
            new ApiResponse(200, { isMember: true }, "Joined organization successfully")
        );
    }
});

export {
    createOrg,
    addOrgAdmin,
    toggleOrgMembership
}
