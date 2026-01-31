import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createEvent, getOrgEvents, toggleRSVP, getEventById } from "../controllers/event.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createEvent);
router.route("/get-org-events").post(getOrgEvents);
router.route("/toggle-rsvp").post(verifyJWT, toggleRSVP);
router.route("/get-event/:eventId").get(getEventById);

export default router;
