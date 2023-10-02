import { Router } from 'express';

import * as controller from './controller.js';
import { uploads } from '../../../uploadsPhotos/uploads.js';

// eslint-disable-next-line new-cap
export const router = Router();

/**
 * /api/v1/auth
 */

router.route('/signin').post(controller.signin);
router.route('/confirmacion/:token').post(controller.authEmail);
router.route('/reenviarcorreo').post(controller.resendEmail);
router.route('/testactivation').post(controller.testActivationLink);

router.route('/recuperarcontrasena/:token').patch(controller.updatePassword);
router.route('/recuperarcontrasena').post(controller.passwordRecovery);

router.param('tipo', controller.tipo);
router.route('/:tipo/signup').post(uploads.array('images'), controller.signup);
