import { Router } from 'express';
import { auth } from '../auth.js';

import * as controller from './controller.js';

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/orden_productos POST        - CREATE
 * /api/v1/orden_productos GET         - READ ALL
 * /api/v1/orden_productos/:id GET     - READ ONE
 * /api/v1/orden_productos/:id PUT     - UPDATE

 */

router.route('/').post(auth, controller.create).get(auth, controller.all);
router.route('/valoraciones').post(auth, controller.getOrdersProductsRatings);

router.param('id', controller.id);

router
  .route('/:id')
  .get(auth, controller.read)
  .put(auth, controller.update)
  .patch(auth, controller.update);
