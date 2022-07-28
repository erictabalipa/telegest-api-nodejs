import { NextFunction, Request, Response } from 'express';
import { IUserPayload } from '../../app/interfaces/IUserPayload';
import { JsonWebToken } from '../../app/services/jsonWebToken';

export function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorization = request.headers.authorization;
  if (!authorization)
    return response.status(401).send({ message: 'Authorization is required!' });

  const token = authorization.split(' ')[1].trim();
  if (!token)
    return response.status(401).send({ message: 'Authorization is required!' });

  const jwt = new JsonWebToken();

  try {
    const data = jwt.decrypt(token) as IUserPayload;

    request.userId = data.id;

    return next();
  } catch (error) {
    return response.status(401).send({ message: 'Authorization is invalid!' });
  }
}
