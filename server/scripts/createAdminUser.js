import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import { validateEmail, validatePassword, validateUsername } from "../utils/sanitize.js";

dotenv.config();

const createAdminUser = async () => {
  const username = validateUsername(process.env.ADMIN_USERNAME);
  const email = validateEmail(process.env.ADMIN_EMAIL);
  const password = validatePassword(process.env.ADMIN_PASSWORD);
  const hashedPassword = await hashPassword(password);
  const now = new Date();

  const existingUser = await User.findOne({ email });
  const usernameConflict = await User.findOne({
    username,
    email: { $ne: email },
  });

  if (usernameConflict) {
    throw new Error("ADMIN_USERNAME is already assigned to another account.");
  }

  if (existingUser) {
    existingUser.username = username;
    existingUser.password = hashedPassword;
    existingUser.role = "admin";
    existingUser.lastLoginAt = now;
    existingUser.lastSeenAt = now;
    await existingUser.save({ validateBeforeSave: false });

    console.log(`Updated admin user: ${existingUser.email}`);
    return;
  }

  const adminUser = new User({
    username,
    email,
    password: hashedPassword,
    role: "admin",
    lastLoginAt: now,
    lastSeenAt: now,
  });

  await adminUser.save({ validateBeforeSave: false });
  console.log(`Created admin user: ${adminUser.email}`);
};

connectDB()
  .then(createAdminUser)
  .then(() => mongoose.connection.close())
  .catch(async (error) => {
    console.error("Admin bootstrap failed:", error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  });
