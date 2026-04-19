import * as userModel from "../models/user.js";
import { hashPassword } from "../utils/hash.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all
const GetAllusers = asyncHandler(async (req, res) => {
  const users = await userModel.getAllusers();

  return res.status(200).json({
    message: "Users retrieved successfully",
    users,
  });
});

// Create user
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check email
  const user = await userModel.findUserByEmail(email);
  if (user) {
    return res.status(409).json({ message: "Email already in use" });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Save user
  const newUser = await userModel.createUser({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return res.status(201).json({
    message: "User created successfully",
    newUser: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { name, email, password, role } = req.body;

  // Hash password
  if (password) {
    password = await hashPassword(password);
  }

  // Update DB
  const updatedUser = await userModel.updateUser(id, {
    name,
    email,
    password,
    role,
  });

  // Check result
  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: "User updated successfully",
    updatedUser,
  });
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isDeleted = await userModel.deleteUser(id);

  // Check result
  if (!isDeleted) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ message: "User deleted successfully" });
});

export { GetAllusers, createUser, updateUser, deleteUser };
