import { Request, Response } from 'express';
import { JsonWebToken } from '../../app/services/jsonWebToken';
import { UserRepository } from '../../database/repositories/userRepository';
import { AuthenticateRequest } from '../requests/dto/auth';
import bcrypt from 'bcrypt';

export class AuthController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JsonWebToken
  ) {}

  authenticate = async (request: Request, response: Response) => {
    try {
      const { email, password } = request.body as AuthenticateRequest;
      if (!email || !password)
        return response
          .status(400)
          .send({ message: 'Informe todos os campos' });

      const user = await this.userRepository.findByEmail(email);
      if (!user)
        return response
          .status(400)
          .send({ message: 'Usuário não registrado!' });

      const passwordIsCorrect = bcrypt.compareSync(password, user.password);
      if (!passwordIsCorrect)
        return response.status(400).send({ message: 'Senha incorreta!' });

      const token = this.jwtService.encrypt(user);

      return response.status(200).send({ token });
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };
}
