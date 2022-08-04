import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { JsonWebToken } from '../../app/services/jsonWebToken';
import { UserRepository } from '../../database/repositories/userRepository';
import { UserController } from '../controllers/userController';
import { Permission } from '../../app/services/permission';
import { ChangeLog } from '../../app/services/changeLog';
import { ChangeLogRepository } from '../../database/repositories/changeLogRepository';

const userRoutes = Router();
userRoutes.use(authMiddleware);

const userController = new UserController(
  new UserRepository(),
  new ChangeLog(new ChangeLogRepository()),
  new JsonWebToken(),
  new Permission()
);

userRoutes.get('/', userController.listAll);
userRoutes.get('/me', userController.me);
userRoutes.post('/', userController.create);
userRoutes.put('/', userController.update);
userRoutes.delete('/', userController.delete);

export { userRoutes };
