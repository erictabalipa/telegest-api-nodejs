import { Request, Response } from 'express';
import { UserRepository } from '../../database/repositories/userRepository';
import { JsonWebToken } from '../../app/services/jsonWebToken';
import { CreateUserRequest } from '../requests/dto/user';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { Permission } from '../../app/services/permission';
import { ChangeLog } from '../../app/services/changeLog';

export class UserController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly changeLogService: ChangeLog,
    private readonly jwtService: JsonWebToken,
    private readonly permissionService: Permission
  ) {}

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
