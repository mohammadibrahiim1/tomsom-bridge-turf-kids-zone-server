import { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export const validateRequest =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body); 
      next();
    } catch (error) {
      next(error);
    }
  };
