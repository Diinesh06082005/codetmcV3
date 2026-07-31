import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "team_lead"],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["global", "room"],
      default: "global",
    },
    roomId: {
      type: String,
      default: null,
      trim: true,
    },
    title: {
      type: String,
      default: "Announcement",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["info", "warning", "urgent"],
      default: "info",
    },
  },
  {
    timestamps: true,
  }
);

export const Broadcast = mongoose.model("Broadcast", broadcastSchema);
