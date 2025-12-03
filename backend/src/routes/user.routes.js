import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import { googleAuth, registerUser } from "../controllers/user.controller"

const router = Router()

router.route("/googleAuth").post(googleAuth)
router.route("/register").post(verifyJWT, registerUser)