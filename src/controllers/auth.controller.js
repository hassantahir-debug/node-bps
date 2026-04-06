const userModel = require("../models/user");
const { comparePassword, hashPassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
const getME = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const GetAllusers = async (req, res) => {
  try {
    const users = await userModel.getAllusers();

    return res.status(200).json({
      message: "Users Get successful",
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// /////////////////////////////////////////////////////////////////////////////////////////

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await userModel.findUserByEmail(email);

    if (user) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await userModel.createUser({
      ...req.body,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "user created successful",
      newUser: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// //////////////////////////////////////////////////

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isDeleted = await userModel.deleteUser(id);

    if (!isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ////////////////////////////////////////////////////////////////////////////////////////

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, email, password, role } = req.body;

    if (password) {
      password = await hashPassword(password); 
    }

    const updatedUser = await userModel.updateUser(id, {
      name,
      email,
      password,
      role,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
  createUser,
  deleteUser,
  login,
  GetAllusers,
  getME,
  updateUser,
};
