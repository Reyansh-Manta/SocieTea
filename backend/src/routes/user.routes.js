import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { googleAuth, registerUser, getUser } from "../controllers/user.controller.js"

const router = Router()

router.route("/googleAuth").post(googleAuth)
router.route("/register").post(verifyJWT, registerUser)
router.route("/getUser").get(verifyJWT, getUser)

export default router
