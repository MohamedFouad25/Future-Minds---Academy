import User from "../models/User.js";
import { connectDB } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await connectDB();
  const { fullName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ fullName, email, password: hashedPassword });
  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
  res.status(201).json({ token, user: newUser });
}
