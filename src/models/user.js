import { DataTypes } from "sequelize";
import db from "../config/db.js";

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: true, // Enables soft deletes
  },
);

const createUser = async (userData) => {
  try {
    const user = await User.create(userData);
    return user.toJSON();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const findUserById = async (id) => {
  try {
    const user = await User.findByPk(id);
    return user ? user.toJSON() : null;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user ? user.toJSON() : null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
};

const updateUser = async (id, userData) => {
  try {
    const [affectedRows] = await User.update(userData, { where: { id } });
    if (affectedRows > 0) {
      return findUserById(id);
    }
    return null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const affectedRows = await User.destroy({ where: { id } });
    return affectedRows > 0;
  } catch (error) {
    console.error("Delete operation is not executed", error);
    throw error;
  }
};

const getAllusers = async () => {
  try {
    const users = await User.findAll();
    return users.map((user) => user.toJSON());
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

export {
  User,
  createUser,
  findUserById,
  findUserByEmail,
  updateUser,
  deleteUser,
  getAllusers,
};
