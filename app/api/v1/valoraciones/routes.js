import { Router } from "express";

import * as controller from "./controller.js";

// eslint-disable-next-line new-cap
export const router = Router({ mergeParams: true });

/**
 * /api/v1/ratings POST        - CREATE
 * /api/v1/ratings GET         - READ ALL
 * /api/v1/ratings/:id GET     - READ ONE
 * /api/v1/ratings/:id PUT     - UPDATE
 * /api/v1/ratings/:id DELETE  - DELETE
 */

router.route("/").post(controller.create).get(controller.all);

router.param("id", controller.id);

router
  .route("/:id")
  .get(controller.read)
  .put(controller.update)
  .patch(controller.update)
  .delete(controller.remove);
