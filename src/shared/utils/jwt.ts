import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

export const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: SignOptions['expiresIn'],
): string => {
  return jwt.sign(payload, secret, { expiresIn: expireTime });
};

export const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
