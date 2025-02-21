import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // Parse JSON bodies (as sent by API clients) and is based on body-parser. It will parse the JSON data and limit the data to 16kb.
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded bodies (as sent by HTML forms) and is based on body-parser. It will parse the URL-encoded data and extended to true. It will parse the URL-encoded data and extended to true.
app.use(express.static("public")); // This will serve the static files from the public directory. It will serve the static files from the public directory.
app.use(cookieParser()); // This will parse the cookies. It will parse the cookies.

//Routes declaration
app.use("/api/v1/users", userRouter);

//http://localhost:8080/api/v1/users/register
// after router setup and declaration this is the API url
export { app };
