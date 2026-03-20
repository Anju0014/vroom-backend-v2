import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import ms from 'ms';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'RESET_TOKEN_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'JWT_RESET_EXPIRES_IN',
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
});

const accessSecret: Secret = process.env.ACCESS_TOKEN_SECRET!;
const refreshSecret: Secret = process.env.REFRESH_TOKEN_SECRET!;
const resetSecret: Secret = process.env.RESET_TOKEN_SECRET!;

const accessOptions: SignOptions = {
  expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as ms.StringValue,
};

const refreshOptions: SignOptions = {
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as ms.StringValue,
};

const resetOptions: SignOptions = {
  expiresIn: process.env.JWT_RESET_EXPIRES_IN as ms.StringValue,
};

class JwtUtils {
  static generateAccessToken(payload: object): string {
    return jwt.sign(payload, accessSecret, accessOptions);
  }

  static generateRefreshToken(payload: object): string {
    return jwt.sign(payload, refreshSecret, refreshOptions);
  }

  static generateResetToken(payload: object): string {
    return jwt.sign(payload, resetSecret, resetOptions);
  }

  static verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, accessSecret) as JwtPayload;
    } catch {
      return null;
    }
  }

  static verifyRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, refreshSecret) as JwtPayload;
    } catch {
      return null;
    }
  }

  static verifyResetToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, resetSecret) as JwtPayload;
    } catch {
      return null;
    }
  }
  static verifyToken(token: string, isRefreshToken = false): JwtPayload | null {
    try {
      const secret = isRefreshToken ? refreshSecret : accessSecret;
      return jwt.verify(token, secret) as JwtPayload;
    } catch {
      return null;
    }
  }
}

export default JwtUtils;
