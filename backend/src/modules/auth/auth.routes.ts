import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate, optionalAuthenticate } from '../../../middleware/auth';

const router = Router();

router.post('/register', optionalAuthenticate, AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticate, AuthController.me);

export default router;
