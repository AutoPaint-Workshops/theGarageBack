import { Router } from "express";

import * as controller from "./controller.js";
import { router as ratingsProducts } from "../valoraciones/routes.js";
import { router as photosProducts } from "../fotos/routes.js";
import { auth, owner } from "../auth.js";
import { uploads } from "../../../uploadsPhotos/uploads.js";

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/services POST        - CREATE
 * /api/v1/services GET         - READ ALL
 * /api/v1/services/search/:searchTerm GET - READ SEARCH
 * /api/v1/services/filter GET - READ FILTER
 * /api/v1/services/:id GET     - READ ONE
 * /api/v1/services/:id PUT     - UPDATE
 * /api/v1/services/:id DELETE  - DELETE
 */

router
  .route("/")
  .post(auth, uploads.array("images"), controller.create)
  .get(controller.all);

router.route("/filter").get(controller.filter);
router.route("/misServicios").get(auth, controller.myServices);
router.route("/search/:searchTerm").get(controller.search);

router.param("id", controller.id);

router
  .route("/:id")
  .get(auth, controller.read)
  .put(auth, owner, uploads.array("images"), controller.update)
  .patch(auth, owner, uploads.array("images"), controller.update)
  .delete(auth, owner, controller.remove);

router.use("/:serviceId/valoraciones", ratingsProducts);
router.use("/:productId/fotos", photosProducts);
