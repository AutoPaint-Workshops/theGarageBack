import { Router } from "express";
import { auth } from "../auth.js";

import * as controller from "./controller.js";

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/orden_servicios POST        - CREATE
 * /api/v1/orden_servicios GET         - READ ALL
 * /api/v1/orden_servicios/:id GET     - READ ONE
 * /api/v1/orden_servicios/:id PUT     - UPDATE

 */

router.route("/").post(auth, controller.create).get(controller.all);

router.param("id", controller.id);

router
  .route("/:id")
  .get(controller.read)
  .put(controller.update)
  .patch(controller.update);
