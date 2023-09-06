import { Router } from "express";

import * as controller from "./controller.js";
import { router as ratingsProducts } from "../valoraciones/routes.js";
import { router as photosProducts } from "../fotos/routes.js";
import { auth, owner } from "../auth.js";
import { uploads } from "../../../uploadsPhotos/uploads.js";

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/products POST        - CREATE
 * /api/v1/products GET         - READ ALL
 * /api/v1/products/:id GET     - READ ONE
 * /api/v1/products/search/:searchTerm GET - READ SEARCH
 * /api/v1/products/:id PUT     - UPDATE
 * /api/v1/products/:id DELETE  - DELETE
 */

router
  .route("/")
  .post(auth, uploads.array("images"), controller.create)
  .get(controller.all);

router.route("/misproductos").get(auth, controller.myProducts);

router.route("/search/:searchTerm").get(controller.search);

router.param("id", controller.id);

router
  .route("/:id")
  .get(auth, controller.read)
  .put(auth, owner, controller.update)
  .patch(auth, owner, controller.update)
  .delete(auth, owner, controller.remove);

router.use("/:productId/valoraciones", ratingsProducts);
router.use("/:productId/fotos", photosProducts);
