import { Request, Response } from 'express';
import { UserRepository } from '../../database/repositories/userRepository';
import { JsonWebToken } from '../../app/services/jsonWebToken';
import { CreateUserRequest } from '../requests/dto/user';
import { Permission } from '../../app/services/permission';
import { ChangeLog } from '../../app/services/changeLog';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

export class UserController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly changeLogService: ChangeLog,
    private readonly jwtService: JsonWebToken,
    private readonly permissionService: Permission
  ) {}

  me = async (request: Request, response: Response) => {
    try {
      const user = await this.userRepository.findById(request.userId);

      return response.status(200).send({ ...user, password: undefined });
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };

  listAll = async (request: Request, response: Response) => {
    try {
      if (
        await this.permissionService.userHasPermission(request, 'user-view')
      ) {
        return response
          .status(401)
          .send({ message: 'Você não tem permissão para ver usuários' });
      }

      const users = await this.userRepository.findAll();

      return response.status(200).send(users);
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };

  update = async (request: Request, response: Response) => {
    try {
      const { id, name, email, password } = request.body as User;

      if (
        await this.permissionService.userHasPermission(request, 'user-update')
      ) {
        return response
          .status(401)
          .send({ message: 'Você não tem permissão para editar usuários' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      const user = await this.userRepository.edit({
        data: {
          email,
          name,
          password: passwordHash,
        },
        where: {
          id,
        },
      });

      return response.status(200).send(user);
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };

  delete = async (request: Request, response: Response) => {
    try {
      const { userId } = request.query;
      if (!userId)
        return response
          .status(400)
          .send({ message: 'Informe todos os campos' });

      if (
        await this.permissionService.userHasPermission(request, 'user-delete')
      ) {
        return response
          .status(401)
          .send({ message: 'Você não tem permissão para deletar usuários' });
      }

      const user = await this.userRepository.delete(Number(userId));

      return response.status(200).send(user);
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };

  create = async (request: Request, response: Response) => {
    try {
      if (
        await this.permissionService.userHasPermission(request, 'user-create')
      ) {
        return response
          .status(401)
          .send({ message: 'Você não tem permissão para criar usuários' });
      }

      const { name, email, password, permissions } =
        request.body as CreateUserRequest;
      if (!name || !email || !password || !permissions)
        return response
          .status(400)
          .send({ message: 'Informe todos os campos' });

      const userAlreadyExists = await this.userRepository.findByEmail(email);
      if (userAlreadyExists)
        return response.status(400).send({ message: 'E-mail já registrado!' });

      const passwordHash = bcrypt.hashSync(password, 10);

      let permissionFiltred = permissions.filter((perm) => {
        return {
          permission: {
            connect: {
              id: perm.permissionId,
            },
          },
        };
      });

      const user = await this.userRepository.save({
        data: {
          name,
          email,
          password: passwordHash,
          PermissionToUser: {
            create: permissionFiltred,
          },
        },
      });

      await this.changeLogService.writeLog(
        request,
        `Criou um usuário: ${user.id}, ${user.name}, ${user.email}`
      );

      const token = this.jwtService.encrypt(user);

      return response.status(201).send({ token });
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };
}
