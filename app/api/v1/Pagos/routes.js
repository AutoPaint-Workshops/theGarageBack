import { Router } from 'express';

import * as controller from './controller.js';

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/pagos POST        - CREATE
 * /api/v1/pagos GET         - READ ALL
 * /api/v1/pagos/:id GET     - READ ONE
 * /api/v1/pagos/:id PUT     - UPDATE
 * /api/v1/pagos/:id DELETE  - DELETE
 */

router.route('/').post(controller.create).get(controller.all);
router.route('/compra_exitosa').get(controller.success);
router.route('/compra_fallida').get(controller.success);
router.route('/compra_pendiente').get(controller.success);
router.route('/mercadopago_webhook').post(controller.receiveWebhook);

router.param('id', controller.id);

router
  .route('/:id')
  .get(controller.read)
  .put(controller.update)
  .patch(controller.update)
  .delete(controller.remove);
