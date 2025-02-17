// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/Connection.js";

dotenv.config({ path: "./env" }); // This will configure the environment variables.

connectDB(); // This will connect to the database.

app
  .on("Error", (error) => {
    // This will handle the error event.
    console.error("Error", error); // This will log the error message.
    throw error; // This will throw the error and stop the server from running.
  })
  .then(() => {
    // This will handle the success event.
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at PORT ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log(`MONGO Db Connection Failed !!!! ${err}`);
  });

//==================================================================================================================================================
/*import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    app.on("Error", (error) => {
      console.error("Error", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error", error);
  }
})();
 */
// Here we are Using IIFE to connect to the database and start the server.
// We are using the constants.js file to get the database name and the port number. We are using the process.env to get the environment variables.
// We are using the mongoose library to connect to the MongoDB database. We are using the express library to create the server. We are using the app.listen method to start the server.
// We are using the app.on method to handle the error event. We are using the console.log method to log the server is running message. We are using the console.error method to log the error message.
