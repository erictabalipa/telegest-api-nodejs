import { Router } from 'express';
import { authRoutes } from './auth';
import { userRoutes } from './user';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);

export { routes };
