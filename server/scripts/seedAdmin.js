import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { connectDB } from "../config/db.js";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";
    const adminUsername = process.env.ADMIN_USERNAME || "adminUser";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists. Enforcing admin role and password...");
      existingAdmin.role = "admin";
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log("Admin is set up correctly with updated credentials.");
      process.exit(0);
    }

    const admin = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log("Admin user seeded successfully:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
