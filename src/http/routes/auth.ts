import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.get('/', authController.authenticate);

export { authRoutes };
