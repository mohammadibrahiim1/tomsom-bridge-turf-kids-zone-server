import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { SlotRoutes } from '../modules/slot/slot.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/slots',
    route: SlotRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
