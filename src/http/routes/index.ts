import { Router } from 'express';
import { authRoutes } from './auth';
import { installtionRoutes } from './installation';
import { permissionRoutes } from './permission';
import { userRoutes } from './user';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/installations', installtionRoutes);
routes.use('/permissions', permissionRoutes);

export { routes };
