import db from "../config/db.js";

const createUser = async (userData) => {
  const { name, email, password, role } = userData;
  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role],
    );
    return findUserById(result.insertId);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const findUserById = async (id) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return rows[0];
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

const updateUser = async (id, userData) => {
  const fields = [];
  const values = [];

  if (userData.name) {
    fields.push("name = ?");
    values.push(userData.name);
  }
  if (userData.email) {
    fields.push("email = ?");
    values.push(userData.email);
  }
  if (userData.password) {
    fields.push("password = ?");
    values.push(userData.password);
  }
  if (userData.role) {
    fields.push("role = ?");
    values.push(userData.role);
  }

  if (fields.length === 0) return null;

  values.push(id);

  try {
    await db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
      values,
    );
    return findUserById(id);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const [result] = await db.query(
      "UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Delete operation is not executed", error);
    throw error;
  }
};

const getAllusers = async () => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE deleted_at IS NULL",
    );
    return rows;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, password, role, created_at FROM users WHERE email = ? AND deleted_at IS NULL",
      [email],
    );
    return rows[0];
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
};

export {
  getAllusers,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  createUser,
};
