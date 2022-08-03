import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { Permission } from '../../app/services/permission';
import { PermissionRepository } from '../../database/repositories/permissionRepository';
import { PermissionController } from '../controllers/permissionController';
import { ChangeLog } from '../../app/services/changeLog';
import { ChangeLogRepository } from '../../database/repositories/changeLogRepository';
import { UserRepository } from '../../database/repositories/userRepository';

const permissionRoutes = Router();
permissionRoutes.use(authMiddleware);

const permissionController = new PermissionController(
  new UserRepository(),
  new PermissionRepository(),
  new Permission(),
  new ChangeLog(new ChangeLogRepository())
);

permissionRoutes.get('/', permissionController.listAll);
permissionRoutes.post('/', permissionController.create);
permissionRoutes.put('/add-to-user', permissionController.addToUser);

export { permissionRoutes };
