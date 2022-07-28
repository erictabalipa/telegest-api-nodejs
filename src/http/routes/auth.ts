import { Router } from 'express';
import { JsonWebToken } from '../../app/services/jsonWebToken';
import { UserRepository } from '../../database/repositories/userRepository';
import { AuthController } from '../controllers/authController';

const authRoutes = Router();
const authController = new AuthController(
  new UserRepository(),
  new JsonWebToken()
);

authRoutes.post('/', authController.authenticate);

export { authRoutes };
