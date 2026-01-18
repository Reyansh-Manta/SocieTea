import Router from "express"
import { feedAllCollegeData, getColleges, submitEmailFormat } from "../controllers/college.controller.js"

const router = Router()

router.route("/feedAllCollegeData").get(feedAllCollegeData)
router.route("/get-colleges").get(getColleges)
router.route("/submit-email-format").post(submitEmailFormat)

export default router