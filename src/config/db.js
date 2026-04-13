// import mysql from "mysql2/promise";

// const pool = mysql.createPool({
//   host: process.env.CONFIG_HOST || "localhost",
//   user: process.env.CONFIG_USER || "root",
//   password: process.env.CONFIG_PASSWORD || "",
//   database: process.env.CONFIG_DATABASE || "bps_db",
//   port: process.env.CONFIG_PORT || 3306,
//   connectionLimit: 10,
//   waitForConnections: true,
// });

// pool
//   .getConnection()
//   .then((connection) => {
//     console.log("Successfully connected to MySQL!");
//     connection.release();
//   })
//   .catch((err) => {
//     console.error("Error connecting to MySQL:", err.message);
//     process.exit(1);
//   });

// export default pool;




import { Sequelize } from 'sequelize';

// Initialize Sequelize with your environment variables or fallbacks
const sequelize = new Sequelize(
  process.env.CONFIG_DATABASE || "bps_db", // Database name
  process.env.CONFIG_USER || "root",      // User
  process.env.CONFIG_PASSWORD || "",      // Password
  {
    host: process.env.CONFIG_HOST || "localhost",
    port: process.env.CONFIG_PORT || 3306,
    dialect: 'mysql', // Explicitly tell Sequelize to use MySQL
    logging: false,   // Set to console.log if you want to see raw SQL in terminal
    
    pool: {
      max: 10,        // Matches your connectionLimit: 10
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    define: {
      // This ensures Sequelize doesn't mess with your Laravel table naming
      timestamps: true,
      underscored: true, 
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  }
);

// Test the connection logic
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to MySQL via Sequelize!");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

testConnection();

export default sequelize;