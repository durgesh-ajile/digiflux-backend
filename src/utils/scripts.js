// scripts/createAdmin.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import connectDb from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

export async function createAdmin() {
  try {
    await connectDb();

    const email = "admin@example.com";
    const password = "admin123";

    console.log("Checking if admin exists...");

    let admin = await User.findOne({ email });

    if (admin) {
      console.log("Admin already exists:");
      console.log("Email:", email);
      process.exit(0);
    }

    console.log("Creating new admin...");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
      status: "active"
    });

    await newAdmin.save();

    console.log("Admin created successfully!");

    process.exit(0);

  } catch (err) {
    console.error("Admin creation failed:", err);
    process.exit(1);
  }
}