const db = require("../config/db");

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
      "SELECT * FROM users WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return rows[0];
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

const updateUser = async (id, userData) => {
  const { name, email, password, role } = userData;
  try {
    const [result] = await db.query(
      "UPDATE users SET name = ?, email = ?,password =? , role = ? WHERE id = ?",
      [name, email, password, role, id],
    );
    return findUserById(id);
  } catch (error) {
    console.error("error in updating user", error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const [result] = await db.query(
      "UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    // return { affectedRows: 1, ... },
    return result.affectedRows > 0; // true agar delete hua, false agar user mila hi nahi
  } catch (error) {
    console.error("Delete operation is not executed", error);
    throw error;
  }
};

const getAllusers = async () => {
  try {
    const [AllUsers] = await db.query(
      "SELECT * FROM users WHERE deleted_at IS NULL",
    );
    return AllUsers;
  } catch (error) {
    console.error("eroor in getting all users", error);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const [user] = await db.query(
      "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL",
      [email],
    );
    return user[0];
  } catch (error) {
    console.error("error in retrival of user ", error);
    throw error;
  }
};

module.exports = {
  getAllusers,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  createUser,
};
