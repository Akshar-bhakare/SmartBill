import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { signupSchema, signinSchema } from '../validators/auth.validator.js';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = signupSchema.parse(req.body);
      const result = await AuthService.signup(validated);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = signinSchema.parse(req.body);
      const result = await AuthService.signin(validated);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
