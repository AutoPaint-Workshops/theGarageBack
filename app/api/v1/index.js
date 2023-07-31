import { Router } from "express";

import { router as products } from "./products/routes.js";

// eslint-disable-next-line new-cap
export const router = Router();

router.use("/products", products);
// router.use("/users", users);
