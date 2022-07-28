import { Request, Response } from 'express';
import { UserRepository } from '../../database/repositories/userRepository';
import { CreateUserRequest } from '../requests/dto/user';
import bcrypt from 'bcrypt';
import { JsonWebToken } from '../../app/services/jsonWebToken';

export class UserController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JsonWebToken
  ) {}

  create = async (request: Request, response: Response) => {
    try {
      const { name, email, password } = request.body as CreateUserRequest;
      if (!name || !email || !password)
        return response
          .status(400)
          .send({ message: 'Informe todos os campos' });

      const userAlreadyExists = await this.userRepository.findByEmail(email);
      if (userAlreadyExists)
        return response.status(400).send({ message: 'E-mail já registrado!' });

      const passwordHash = bcrypt.hashSync(password, 10);

      const user = await this.userRepository.save({
        data: {
          name,
          email,
          password: passwordHash,
        },
      });

      const token = this.jwtService.encrypt(user);

      return response.status(201).send({ token });
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };
}
