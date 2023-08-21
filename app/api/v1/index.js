import { Router } from "express";

import { router as products } from "./productos/routes.js";
import { router as ratings } from "./valoraciones/routes.js";
import { router as photos } from "./fotos/routes.js";
import { router as categorys } from "./categorias/routes.js";
import { router as services } from "./servicios/routes.js";

// eslint-disable-next-line new-cap
export const router = Router();

router.use("/productos", products);
router.use("/servicios", services);
router.use("/valoraciones", ratings);
router.use("/fotos", photos);
router.use("/categorias", categorys);
