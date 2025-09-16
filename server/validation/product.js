import Joi from 'joi';


export const productValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(200).trim().required(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().min(2).max(100).trim().required(),
    description: Joi.string().min(10).max(1000).trim().required()
  });
  return schema.validate(data);
};

export const queryValidation = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(200).trim().allow('').default('')
  });
  return schema.validate(data);
};