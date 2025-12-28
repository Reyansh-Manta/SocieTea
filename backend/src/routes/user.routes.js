import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { googleAuth, registerUser } from "../controllers/user.controller.js"

const router = Router()

router.route("/googleAuth").post(googleAuth)
router.route("/register").post(verifyJWT, registerUser)

export default router
