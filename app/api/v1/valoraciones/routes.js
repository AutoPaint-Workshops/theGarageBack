import { Router } from "express";

import * as controller from "./controller.js";
import { auth, owner } from "../auth.js";

// eslint-disable-next-line new-cap
export const router = Router({ mergeParams: true });

/**
 * /api/v1/ratings POST        - CREATE
 * /api/v1/ratings GET         - READ ALL
 * /api/v1/ratings/:id GET     - READ ONE
 * /api/v1/ratings/:id PUT     - UPDATE
 * /api/v1/ratings/:id DELETE  - DELETE
 */

router.route("/").post(auth, controller.create).get(controller.all);

router.param("id", controller.id);

router
  .route("/:id")
  .get(auth, controller.read)
  .put(auth, controller.update) // ? Usuario puede actualizar su valoracion ?
  .patch(auth, controller.update) // ? Usario puede actualizar su valoracion ?
  .delete(auth, controller.remove); // ? Usario puede eliminar su valoracion ?
