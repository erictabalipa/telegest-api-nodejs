import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { Permission } from '../../app/services/permission';
import { InstallationController } from '../controllers/installationController';
import { InstallationRepository } from '../../database/repositories/installationRepository';

const installtionRoutes = Router();
installtionRoutes.use(authMiddleware);

const installationController = new InstallationController(
  new InstallationRepository(),
  new Permission()
);

installtionRoutes.post('/', installationController.create);

export { installtionRoutes };
