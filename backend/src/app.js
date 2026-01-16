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

app.use("/api/v1/user", userRouter)
app.use("/api/v1/college", collegeRouter)

export {app}