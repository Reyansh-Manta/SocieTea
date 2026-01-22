import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createOrg, addOrgAdmin } from "../controllers/organizations.controllers.js";

const router = Router();

router.route("/create").post(verifyJWT, createOrg);
router.route("/add-admin").post(verifyJWT, addOrgAdmin);

export default router;
