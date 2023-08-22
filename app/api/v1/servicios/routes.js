import { Router } from "express";

import * as controller from "./controller.js";
import { router as ratingsProducts } from "../valoraciones/routes.js";
import { router as photosProducts } from "../fotos/routes.js";

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/services POST        - CREATE
 * /api/v1/services GET         - READ ALL
 * /api/v1/services/:search GET - READ SEARCH
 * /api/v1/services/:id GET     - READ ONE
 * /api/v1/services/:id PUT     - UPDATE
 * /api/v1/services/:id DELETE  - DELETE
 */

router.route("/").post(controller.create).get(controller.all);
router.route("/:searchTerm").get(controller.search);

router.param("id", controller.id);

router
  .route("/:id")
  .get(controller.read)
  .put(controller.update)
  .patch(controller.update)
  .delete(controller.remove);

router.use("/:productId/valoraciones", ratingsProducts);
router.use("/:productId/fotos", photosProducts);
