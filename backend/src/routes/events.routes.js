import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createEvent, getOrgEvents } from "../controllers/event.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createEvent);
router.route("/get-org-events").post(getOrgEvents);

export default router;
