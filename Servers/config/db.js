// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Falls back to local database if process.env.MONGO_URI isn't loaded yet
    const dbURI = process.env.MONGO_URI ;
    const conn = await mongoose.connect(`${dbURI}`);
    
    console.log(`🚀 MongoDB Connected !!`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error}`);
    process.exit(1); // Force terminate application engine execution if connection fails
  }
};

module.exports = connectDB;