import Router from "express"
import { feedAllCollegeData, getColleges, submitEmailFormat, getCollegeOrgs } from "../controllers/college.controller.js"

const router = Router()

router.route("/feedAllCollegeData").get(feedAllCollegeData)
router.route("/get-colleges").get(getColleges)
router.route("/submit-email-format").post(submitEmailFormat)
router.route("/get-college-orgs").post(getCollegeOrgs)

export default router