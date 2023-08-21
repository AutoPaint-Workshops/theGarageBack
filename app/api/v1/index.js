import { Router } from "express";

import { router as products } from "./products/routes.js";

import { router as ordenProductos } from "./Orden_Productos/routes.js";

// eslint-disable-next-line new-cap
export const router = Router();

router.use("/products", products);
router.use("/orden_productos", ordenProductos);
// router.use("/users", users);
