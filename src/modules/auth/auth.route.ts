import express from 'express';
import { AuthController } from './auth.controller';
// import { validateRequest } from '../../../shared/middlewares/validateRequest';
import { registerUserSchema, loginUserSchema } from '../user/user.validation';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import { auth } from '../../shared/middlewares/auth.middleware';
// import { auth } from '../../../shared/middlewares/auth.middleware';

const router = express.Router();

router.post('/register', validateRequest(registerUserSchema), AuthController.registerUser);
router.post('/login', validateRequest(loginUserSchema), AuthController.loginUser);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logoutUser);

router.get('/me', auth(), AuthController.getMe);

export const AuthRoutes = router;