// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../config/database'); // Adjust path to your db config

// class User extends Model {}

// User.init({
//   // Matches Laravel's 'name'
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   // Matches Laravel's 'email'
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     validate: {
//       isEmail: true
//     }
//   },
//   // Matches Laravel's 'password'
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   // Matches Laravel's 'role'
//   role: {
//     type: DataTypes.ENUM('Admin', 'Biller', 'Poster','Doctor'),
//     allowNull: false,
//     defaultValue: 'Biller'
//   }
// }, {
//   sequelize,
//   modelName: 'User',
//   tableName: 'users',      // Explicitly naming the table to match Laravel
//   underscored: true,      // Tells Sequelize to use created_at, updated_at
//   timestamps: true,       // Enables created_at and updated_at
//   paranoid: true,         // 🔥 This enables Soft Deletes (deleted_at)
  
//   // This mirrors Laravel's $hidden property
//   defaultScope: {
//     attributes: { exclude: ['password'] }
//   },
//   scopes: {
//     withPassword: {
//       attributes: { include: ['password'] }
//     }
//   }
// });

// module.exports = User;