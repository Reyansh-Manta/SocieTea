import Router from "express"
import { feedAllCollegeData } from "../controllers/college.controller.js"

const router = Router()

router.route("/feedAllCollegeData").get(feedAllCollegeData)

export default router