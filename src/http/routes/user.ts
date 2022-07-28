import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { JsonWebToken } from '../../app/services/jsonWebToken';
import { UserRepository } from '../../database/repositories/userRepository';
import { UserController } from '../controllers/userController';

const userRoutes = Router();
userRoutes.use(authMiddleware);

const userController = new UserController(
  new UserRepository(),
  new JsonWebToken()
);

userRoutes.post('/', userController.create);

export { userRoutes };
