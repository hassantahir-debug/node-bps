const mysql = require("mysql");
const app = require("./src/app");
const { Model } = require("sequelize");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.CONFIG_HOST || "localhost",
  user: process.env.CONFIG_USER || "root",
  password: process.env.CONFIG_PASSWORD || "",
  database: process.env.CONFIG_DATABASE || "bps_db",
  port: process.env.CONFIG_PORT || 3306,
  connectionLimit: 10,
});

// Testing the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to XAMPP MySQL:", err.message);
    return;
  }
  console.log("Successfully connected to XAMPP MySQL!");
  connection.release();
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = pool;