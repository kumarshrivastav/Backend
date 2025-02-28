import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import profileRouter from "./routes/profile.routes.js";
import newsRouter from "./routes/news.routes.js";
import { v2 as cloudinary } from "cloudinary";
import helmet from "helmet";
import { globalRateLimit } from "./config/apiRateLimiting.js";
import "./jobs/queueIndex.js"
dotenv.config();
const app = express();
const port = process.env.PORT;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet())
app.use(globalRateLimit)



app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/news", newsRouter);
const server = app.listen(port, () => {
  console.log(`Server started at http://localhost:${server.address().port}`);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).send({ success: false, statusCode, message });
  next();
});
