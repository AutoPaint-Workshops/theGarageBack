import { Router } from "express";

import { router as pagos } from "./Pagos/routes.js";

import { router as ordenProductos } from "./Orden_Productos/routes.js";
import { router as detalleOrdenProductos } from "./Detalle_Orden_Productos/routes.js";
import { router as ordenServicios } from "./Orden_Servicios/routes.js";
import { router as detalleOrdenServicios } from "./Detalle_Orden_Servicios/routes.js";
// eslint-disable-next-line new-cap
export const router = Router();

router.use("/pagos", pagos);
router.use("/orden_productos", ordenProductos);
router.use("/orden_servicios", ordenServicios);
router.use("/detalle_orden_productos", detalleOrdenProductos);
router.use("/detalle_orden_servicios", detalleOrdenServicios);

// router.use("/users", users);
