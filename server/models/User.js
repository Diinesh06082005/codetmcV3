import mongoose from "mongoose";
import {
  comparePassword,
  hashPassword,
  isHashedPassword,
} from "../utils/password.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
    lastSessionDurationMs: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    roomLimit: {
      type: Number,
      default: 4,
    },
    roomsCreatedToday: {
      count: {
        type: Number,
        default: 0,
      },
      date: {
        type: Date,
        default: null,
      },
    },
    upgradeStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

userSchema.pre("save", async function hashUserPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  if (isHashedPassword(this.password)) {
    return next();
  }

  this.password = await hashPassword(this.password);
  return next();
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
