import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import { validateEmail, validatePassword, validateUsername } from "../utils/sanitize.js";

dotenv.config();

const createOrUpdateAccount = async ({ username, email, password, role }) => {
  const hashedPassword = await hashPassword(password);
  const now = new Date();

  let user = await User.findOne({ $or: [{ email }, { username }] });
  if (user) {
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    user.role = role;
    user.lastLoginAt = now;
    user.lastSeenAt = now;
    await user.save({ validateBeforeSave: false });
    console.log(`Updated ${role} account: ${email} (${username})`);
  } else {
    user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      lastLoginAt: now,
      lastSeenAt: now,
    });
    await user.save({ validateBeforeSave: false });
    console.log(`Created ${role} account: ${email} (${username})`);
  }
};

const createAdminUser = async () => {
  const username = validateUsername(process.env.ADMIN_USERNAME || "admin_owner");
  const email = validateEmail(process.env.ADMIN_EMAIL || "dinesh@gmail.com");
  const password = validatePassword(process.env.ADMIN_PASSWORD || "StrongPass123");

  // Bootstrap primary admin from environment variables
  await createOrUpdateAccount({ username, email, password, role: "admin" });

  // Bootstrap demo quick-fill admin account
  await createOrUpdateAccount({
    username: "admin_demo",
    email: "admin@codetmc.com",
    password: "Admin@123",
    role: "admin",
  });

  // Bootstrap demo quick-fill developer account
  await createOrUpdateAccount({
    username: "dev_demo",
    email: "dev@codetmc.com",
    password: "Dev@123456",
    role: "user",
  });
};

connectDB()
  .then(createAdminUser)
  .then(() => mongoose.connection.close())
  .catch(async (error) => {
    console.error("Admin bootstrap failed:", error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  });
