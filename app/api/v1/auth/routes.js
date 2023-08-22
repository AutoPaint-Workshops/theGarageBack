import { Router } from 'express';

import * as controller from './controller.js';

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/products POST        - CREATE
 * /api/v1/products GET         - READ ALL
 * /api/v1/products/:id GET     - READ ONE
 * /api/v1/products/:id PUT     - UPDATE
 * /api/v1/products/:id DELETE  - DELETE
 */

router.route('/signin').post(controller.signin);
router.route('/signup/client').post(controller.signupClient);
router.route('/signup/company').post(controller.signupCompany);
router
  .route('/recuperarcontrasena')
  .post(controller.passwordRecovery)
  .patch(controller.updatePassword);
