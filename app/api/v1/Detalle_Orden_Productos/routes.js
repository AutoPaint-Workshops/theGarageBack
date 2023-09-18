import { Router } from "express";

import * as controller from "./controller.js";

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/detalle_orden_productos POST        - CREATE
 * /api/v1/detalle_orden_productos GET         - READ ALL
 * /api/v1/detalle_orden_productos/:id GET     - READ ONE
 * /api/v1/detalle_orden_productos/:id PUT     - UPDATE
 * /api/v1/detalle_orden_productos/:id DELETE  - DELETE
 */

// router.route("/").post(controller.create).get(controller.all);
router.route("/").get(controller.all);
router.param("id", controller.id);
router.param("id_orden", controller.idOrden);
router.route("/id").get(controller.read);
