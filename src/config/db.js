const mysql = require("mysql2/promise");
require("dotenv").config();


const pool = mysql.createPool({
  host: process.env.CONFIG_HOST || "localhost",
  user: process.env.CONFIG_USER || "root",
  password: process.env.CONFIG_PASSWORD || "",
  database: process.env.CONFIG_DATABASE || "bps_db",
  port: process.env.CONFIG_PORT || 3306,
  connectionLimit: 10,
  waitForConnections: true,
});

pool.getConnection()
    .then((connection) => {
        console.log("Successfully connected to MySQL!");
        connection.release();
    })
    .catch((err) => {
        console.error("Error connecting to MySQL:", err.message);
        process.exit(1);
    });

module.exports = pool;