import { Router } from 'express';

import { router as products } from './productos/routes.js';
import { router as ratings } from './valoraciones/routes.js';
import { router as photos } from './fotos/routes.js';
import { router as categorys } from './categorias/routes.js';
import { router as auth } from './auth/routes.js';
import { router as perfil } from './perfil/routes.js';
import { router as pagos } from './Pagos/routes.js';

import { router as ordenProductos } from './Orden_Productos/routes.js';
import { router as detalleOrdenProductos } from './Detalle_Orden_Productos/routes.js';

// eslint-disable-next-line new-cap
export const router = Router();

router.use('/productos', products);
router.use('/valoraciones', ratings);
router.use('/fotos', photos);
router.use('/categorias', categorys);
router.use('/auth', auth);
router.use('/perfil', perfil);
router.use('/pagos', pagos);
router.use('/orden_productos', ordenProductos);
router.use('/detalle_orden_productos', detalleOrdenProductos);
