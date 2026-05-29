import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 64,
      index: true,
    },
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 100,
        message: "A room cannot have more than 100 members.",
      },
    },
    code: {
      type: String,
      default: "// Start collaborating in real time...",
      maxlength: 200000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalJoins: {
      type: Number,
      default: 0,
    },
    history: {
      type: [
        {
          code: {
            type: String,
            required: true,
          },
          language: {
            type: String,
            required: true,
          },
          savedBy: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model("Room", roomSchema);
