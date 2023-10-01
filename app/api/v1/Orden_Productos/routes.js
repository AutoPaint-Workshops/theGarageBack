import { Router } from "express";
import { auth } from "../auth.js";

import * as controller from "./controller.js";

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/orden_productos POST        - CREATE
 * /api/v1/orden_productos GET         - READ ALL
 * /api/v1/orden_productos/:id GET     - READ ONE
 * /api/v1/orden_productos/:id PUT     - UPDATE

 */

router.route("/").post(auth, controller.create).get(controller.all);

router.param("id", controller.id);

router
  .route("/:id")
  .get(controller.read)
  .put(controller.update)
  .patch(controller.update);

// router.route('/:id/crear_orden').post(auth, controller.createOrder);
