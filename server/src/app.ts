import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CROSS_ORIGIN,
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// import route
import userRoute from "./routes/user.route";
app.use("/api/v1/user", userRoute);


export default app;
