import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } from '../schemas/collectif.schema.js';

export const validateRequestBody = (schema: any) => {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      const errors = result.error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({ 
        error: 'Données invalides',
        details: errors 
      });
    }
    
    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: any) => {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.params);
    
    if (!result.success) {
      const errors = result.error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({ 
        error: 'Paramètres invalides',
        details: errors 
      });
    }
    
    req.params = result.data;
    next();
  };
};