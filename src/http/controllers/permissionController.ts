import { Request, Response } from 'express';
import { Permission as PermissionModel } from '@prisma/client';
import { Permission } from '../../app/services/permission';
import { PermissionRepository } from '../../database/repositories/permissionRepository';
import { ChangeLog } from '../../app/services/changeLog';
import { UserRepository } from '../../database/repositories/userRepository';

export class PermissionController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionService: Permission,
    private readonly changeLogService: ChangeLog
  ) {}

  listAll = async (request: Request, response: Response) => {
    try {
      if (
        await this.permissionService.userHasPermission(
          request,
          'permission-view'
        )
      ) {
        return response
          .status(401)
          .send({ message: 'Você não tem permissão para ver permissões' });
      }

      const permissions = await this.permissionRepository.findAll();

      return response.status(200).send(permissions);
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };

  create = async (request: Request, response: Response) => {
    try {
      const { title, code } = request.body as PermissionModel;
      if (!title || !code)
        return response
          .status(400)
          .send({ message: 'Informe todos os campos' });

      if (
        await this.permissionService.userHasPermission(
          request,
          'permission-create'
        )
      ) {
        return response
          .status(401)
          .send({ message: 'Você não tem permissão para criar permissões' });
      }

      const permissionCodeAlreadyExist =
        await this.permissionRepository.findByCode(code);

      if (permissionCodeAlreadyExist)
        return response
          .status(400)
          .send({ message: 'Já existe uma permissão com este código' });

      const permission = await this.permissionRepository.save({
        data: {
          title,
          code,
        },
      });

      await this.changeLogService.writeLog(
        request,
        `Criou a permissão: ${permission.title} - ${permission.code}`
      );

      return response.status(200).send(permission);
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };

  addToUser = async (request: Request, response: Response) => {
    try {
      const { userId, code } = request.query;
      if (!userId || !code)
        return response
          .status(400)
          .send({ message: 'Informe todos os campos' });

      if (
        await this.permissionService.userHasPermission(
          request,
          'permission-add-to-user'
        )
      ) {
        return response
          .status(401)
          .send({
            message: 'Você não tem permissão adicionar permissões a um usuário',
          });
      }

      const permissionExists = await this.permissionRepository.findByCode(
        code.toString()
      );

      if (!permissionExists)
        return response
          .status(400)
          .send({ message: 'Não encontramos uma permissão com esse código' });

      const permission = await this.permissionRepository.addToUser(
        permissionExists.id,
        Number(userId)
      );

      await this.changeLogService.writeLog(
        request,
        `Permissão ${permissionExists.title} adicionada ao usuário de id: ${userId}`
      );

      return response.status(200).send(permission);
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };
}
