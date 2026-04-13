import mongoose from "mongoose";

/**
 * Establishment of connection to MongoDB Atlas.
 * Uses MONGO_URI from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`System Status: MongoDB Connected - ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;