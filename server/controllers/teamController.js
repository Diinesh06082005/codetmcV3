import { Team } from "../models/Team.js";
import { TeamInvitation } from "../models/TeamInvitation.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

// Create a Team
export const createTeam = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Team name is required.");
  }

  // Create team with owner as current user, and also add owner as a member
  const team = await Team.create({
    name: name.trim(),
    owner: req.user._id,
    members: [req.user._id],
  });

  return res.status(201).json({
    success: true,
    message: "Team created successfully.",
    team,
  });
});

// Get My Teams
export const getMyTeams = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find teams where user is owner OR a member
  const teams = await Team.find({
    $or: [{ owner: userId }, { members: userId }],
  })
    .populate("owner", "username email")
    .populate("members", "username email")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    teams,
  });
});

// Get Team Details
export const getTeamDetails = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team ID.");
  }

  const team = await Team.findById(teamId)
    .populate("owner", "username email")
    .populate("members", "username email");

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Check if current user is owner or member
  const currentUserId = req.user._id.toString();
  const ownerId = team.owner?._id?.toString() || team.owner?.toString() || "";
  const isMember = team.members.some(
    (member) => (member?._id?.toString() || member?.toString()) === currentUserId
  );

  if (!isMember && ownerId !== currentUserId) {
    throw new ApiError(403, "You are not authorized to view this team.");
  }

  return res.json({
    success: true,
    team,
  });
});

// Invite to Team
export const inviteToTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { invitee } = req.body; // Can be email, username or unique User ID

  if (!invitee || typeof invitee !== "string" || !invitee.trim()) {
    throw new ApiError(400, "User email, username, or unique ID is required.");
  }

  const queryValue = invitee.trim();

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team ID.");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found.");
  }

  // Ensure current user is the owner or a member
  const currentUserId = req.user._id.toString();
  const ownerId = team.owner?._id?.toString() || team.owner?.toString() || "";
  const isMember = team.members.some(
    (member) => (member?._id?.toString() || member?.toString()) === currentUserId
  );

  if (!isMember && ownerId !== currentUserId) {
    throw new ApiError(403, "Only team members can invite others.");
  }

  // Find the receiver user
  let receiver = null;
  if (mongoose.Types.ObjectId.isValid(queryValue)) {
    receiver = await User.findById(queryValue);
  } else {
    receiver = await User.findOne({
      $or: [
        { email: queryValue.toLowerCase() },
        { username: queryValue }
      ],
    });
  }

  if (!receiver) {
    throw new ApiError(404, "User not found.");
  }

  // Cannot invite oneself
  if (receiver._id.toString() === currentUserId) {
    throw new ApiError(400, "You cannot invite yourself.");
  }

  // Check if receiver is already a member
  const alreadyMember = team.members.some(
    (member) => (member?._id?.toString() || member?.toString()) === receiver._id.toString()
  );

  if (alreadyMember) {
    throw new ApiError(400, "User is already a member of this team.");
  }

  // Check for existing pending invitation
  const existingInvitation = await TeamInvitation.findOne({
    teamId,
    receiverId: receiver._id,
    status: "pending",
  });

  if (existingInvitation) {
    throw new ApiError(400, "An invitation is already pending for this user.");
  }

  // Create the invitation
  const invitation = await TeamInvitation.create({
    teamId,
    senderId: req.user._id,
    receiverId: receiver._id,
  });

  return res.status(201).json({
    success: true,
    message: "Invitation sent successfully.",
    invitation,
  });
});

// Get My Invitations
export const getMyInvitations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const invitations = await TeamInvitation.find({
    receiverId: userId,
    status: "pending",
  })
    .populate("teamId", "name")
    .populate("senderId", "username email")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    invitations,
  });
});

// Respond to Invitation
export const respondToInvitation = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;
  const { action } = req.body; // "accept" or "reject"

  if (!["accept", "reject"].includes(action)) {
    throw new ApiError(400, "Invalid action. Use 'accept' or 'reject'.");
  }

  if (!mongoose.Types.ObjectId.isValid(invitationId)) {
    throw new ApiError(400, "Invalid invitation ID.");
  }

  const invitation = await TeamInvitation.findById(invitationId);

  if (!invitation || invitation.status !== "pending") {
    throw new ApiError(404, "Pending invitation not found.");
  }

  // Ensure current user is the receiver of the invitation
  if (invitation.receiverId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to respond to this invitation.");
  }

  if (action === "accept") {
    invitation.status = "accepted";
    await invitation.save();

    // Add user to the team members
    await Team.findByIdAndUpdate(invitation.teamId, {
      $addToSet: { members: req.user._id },
    });
  } else {
    invitation.status = "rejected";
    await invitation.save();
  }

  return res.json({
    success: true,
    message: `Invitation ${action}ed successfully.`,
  });
});
