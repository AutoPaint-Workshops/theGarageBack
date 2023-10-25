import { Router } from "express";
import * as controller from "./controller.js";
import { auth } from "../auth.js";

// eslint-disable-next-line new-cap
export const router = Router();

/**

 */

router.route("/").post(auth, controller.create).get(auth, controller.list);
router.route("/:id").get(auth, controller.get);
