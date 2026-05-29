import express from "express";
import {
  createTeam,
  getMyTeams,
  getTeamDetails,
  inviteToTeam,
  getMyInvitations,
  respondToInvitation,
} from "../controllers/teamController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const teamRouter = express.Router();

teamRouter.use(requireAuth);

teamRouter.post("/", createTeam);
teamRouter.get("/", getMyTeams);
teamRouter.get("/invitations", getMyInvitations);
teamRouter.get("/:teamId", getTeamDetails);
teamRouter.post("/:teamId/invite", inviteToTeam);
teamRouter.put("/invitations/:invitationId", respondToInvitation);
