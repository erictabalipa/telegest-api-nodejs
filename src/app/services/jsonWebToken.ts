import jwt from 'jsonwebtoken';

export class JsonWebToken {
  encrypt(payload: any): string {
    try {
      const token = jwt.sign(payload, process.env.JWT_TOKEN || 'dev_token');

      return token;
    } catch (error) {
      throw new Error('Error encrypting jwt.');
    }
  }
  decrypt<T>(token: string): T {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_TOKEN || 'dev_token'
      ) as T;

      return payload;
    } catch (error) {
      throw new Error('Error encrypting jwt.');
    }
  }
}
