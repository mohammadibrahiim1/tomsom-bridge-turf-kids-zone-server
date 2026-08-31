import express from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import { loginUserSchema } from '../user/user.validation';
import { auth } from '../../shared/middlewares/auth';

const router = express.Router();

router.post('/login', validateRequest(loginUserSchema), AuthController.loginUser);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logoutUser);

router.get('/me', auth(), AuthController.getMe);

export const AuthRoutes = router;
