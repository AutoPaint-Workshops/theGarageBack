import { Router } from 'express';

import * as controller from './controller.js';
import { auth } from '../auth.js';
import { uploads } from '../../../uploadsPhotos/uploads.js';

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/products POST        - CREATE
 * /api/v1/products GET         - READ ALL
 * /api/v1/products/:id GET     - READ ONE
 * /api/v1/products/:id PUT     - UPDATE
 * /api/v1/products/:id DELETE  - DELETE
 */

router
  .route('/')
  .get(auth, controller.read)
  .put(auth, uploads.array('images'), controller.update)
  .patch(auth, uploads.array('images'), controller.update);

router.route('/cambiarcontrasena').put(auth, controller.changePassword);
router.route('/usuarios/:tipo').get(auth, controller.allByType);
router.route('/usuarios').get(auth, controller.all);
router.route('/empresas').get(controller.allCompanys);

router.param('id', controller.id);

router
  .route('/:id')
  .get(auth, controller.userById)
  .put(auth, uploads.array('images'), controller.updateById)
  .patch(auth, uploads.array('images'), controller.updateById);
