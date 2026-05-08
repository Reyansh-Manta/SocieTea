import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({
  extended: true,
  limit: "10000kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Backend is live ✅");
});

import userRouter from "./routes/user.routes.js"
import collegeRouter from "./routes/college.routes.js"
import orgRouter from "./routes/orgs.routes.js"
import eventRouter from "./routes/events.routes.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/college", collegeRouter)
app.use("/api/v1/orgs", orgRouter)
app.use("/api/v1/events", eventRouter)

import { ApiError } from "./utils/ApiError.js"

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            message: err.message,
            success: err.success,
            errors: err.errors
        });
    }
    
    console.error(err);
    return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        success: false
    });
});

export { app }