/**
 * User Validators
 */

import Joi from 'joi';
import { ValidationError } from '@/utils/errors';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const validateRegister = (data: any) => {
  const { error, value } = registerSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
};

export const validateLogin = (data: any) => {
  const { error, value } = loginSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
};
