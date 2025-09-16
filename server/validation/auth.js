import Joi from 'joi';

export const registerValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).trim().lowercase().email().required(),
    password: Joi.string().min(8).max(128).required(),
    name: Joi.string().min(2).max(100).trim().required(),
    role: Joi.string().valid('customer', 'admin').default('customer')
  });
  return schema.validate(data);
};

export const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).trim().lowercase().email().required(),
    password: Joi.string().min(1).max(128).required()
  });
  return schema.validate(data);
};