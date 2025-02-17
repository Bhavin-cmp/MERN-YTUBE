import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed::: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
// Here we are using the connectDB function to connect to the MongoDB database.
//  We are using the mongoose library to connect to the MongoDB database.
// We are using the constants.js file to get the database name. We are using the process.env to get the environment variables.
// We are using the console.log method to log the MongoDB connected message.
// We are using the console.error method to log the MongoDB connection failed message.
// We are using the process.exit method to exit the process with an error code.
// We are using the export default connectDB statement to export the connectDB function.
