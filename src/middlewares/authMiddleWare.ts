import { Request, Response, NextFunction } from 'express';
import JwtUtils from '../utils/jwtUtils';
import { Customer } from '../models/customer/customerModel';
import { CarOwner } from '../models/carowner/carOwnerModel';
import { StatusCode } from '@constants/statusCode';
import jwt from 'jsonwebtoken';

export interface CustomRequest extends Request {
  userId?: string;
  email?: string;
  role?: 'carOwner' | 'customer' | 'admin';
}
const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized. Token missing.' });
      return;
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const decoded = JwtUtils.verifyToken(token);

    if (!decoded || typeof decoded !== 'object') {
      res.status(StatusCode.UNAUTHORIZED).json({ message: 'Invalid token.' });
      return;
    }

    const { id, email, role } = decoded as {
      id: string;
      email: string;
      role: 'carOwner' | 'customer' | 'admin';
    };

    if (!id || !email || !role) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: 'Invalid token payload.' });
      return;
    }

    req.userId = id;
    req.email = email;
    req.role = role;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: 'Token expired. Please login again.' });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: 'Invalid token.' });
      return;
    }

    res.status(StatusCode.UNAUTHORIZED).json({ message: 'Authentication failed.' });
    return;
  }
};

/**
 * Role Authorization Middleware
 */
export const verifyRole = (allowedRoles: ('carOwner' | 'customer' | 'admin')[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(StatusCode.FORBIDDEN).json({ message: 'Forbidden: Access denied.' });
      return;
    }
    next();
  };
};

/**
 * Blocked User Check Middleware
 */
export const checkBlocked = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, role } = req;

    if (!userId || !role) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized request.' });
      return;
    }

    if (role === 'admin') {
      next();
      return;
    }

    const user =
      role === 'customer'
        ? await Customer.findById(userId).lean()
        : await CarOwner.findById(userId).lean();

    if (!user) {
      res.status(StatusCode.NOT_FOUND).json({ message: 'User not found.' });
      return;
    }

    if (user.blockStatus === 1) {
      res.status(StatusCode.FORBIDDEN).json({
        message: 'Your account is blocked. Please contact support.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Blocked user check failed:', error);
    res.status(StatusCode.BAD_REQUEST).json({ message: 'Internal server error.' });
  }
};

export default authMiddleware;
