import * as userModel from "../models/user.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user
  const user = await userModel.findUserByEmail(email, true);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Verify password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate token
  const token = generateToken(user);
  const { password: _, ...safeUser } = user;

  // Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: false,
  });

  return res.status(200).json({
    message: "Login successful",
    token,
    user: safeUser,
  });
});

// Get profile
const getME = asyncHandler(async (req, res) => {
  const user = await userModel.findUserById(req.user.id);

  return res.status(200).json({
    message: "User retrieved successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // expire immediately
  });
  return res.status(200).json({ message: "Logged out successfully" });
});

export { login, getME, logout };

