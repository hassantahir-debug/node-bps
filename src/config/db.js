import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(
  process.env.CONFIG_DATABASE || "bps_db", 
  process.env.CONFIG_USER || "root",      
  process.env.CONFIG_PASSWORD || "",    
  {
    host: process.env.CONFIG_HOST || "localhost",
    port: process.env.CONFIG_PORT || 3306,
    dialect: 'mysql', // Explicitly tell Sequelize to use MySQL
    logging: false,   // Set to console.log if you want to see raw SQL in terminal

    define: {
      timestamps: true,
      underscored: true, 
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  }
);

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