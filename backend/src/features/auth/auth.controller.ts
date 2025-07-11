// features/auth/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./auth.models";
import { config } from "../../config";

export const signupController = async (req: Request, res: Response) => {
  const { userName, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
        res.status(409).json({ message: "User already exists" });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ userName, email, password: hashedPassword });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.log("Signup error:", err);
    res.status(500).json({ message: "Internal server error: Signup" });
  }
};

export const signinController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: "1h" });
    res.status(200).json({ message: "Signin successful", token });
  } catch (err) {
    console.log("Signin error:", err);
    res.status(500).json({ message: "Internal server error: Signin" });
  }
};
