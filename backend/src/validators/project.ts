/**
 * Project Validators
 */

import Joi from 'joi';
import { ValidationError } from '@/utils/errors';

const nodeSchema = Joi.object({
  id: Joi.string().uuid().required(),
  type: Joi.string()
    .valid('api-server', 'database', 'cache', 'load-balancer', 'message-queue', 'worker', 'storage', 'service')
    .required(),
  position: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
  }).required(),
  metadata: Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500).allow(''),
    technology: Joi.string().max(100),
    config: Joi.object().default({}),
  }).required(),
});

const edgeSchema = Joi.object({
  id: Joi.string().uuid().required(),
  source: Joi.string().uuid().required(),
  target: Joi.string().uuid().required(),
  label: Joi.string().max(100).required(),
  type: Joi.string().valid('http', 'grpc', 'message-queue', 'database', 'event'),
});

export const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  nodes: Joi.array().items(nodeSchema).default([]),
  edges: Joi.array().items(edgeSchema).default([]),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  description: Joi.string().max(1000).allow(''),
  nodes: Joi.array().items(nodeSchema),
  edges: Joi.array().items(edgeSchema),
}).min(1);

export const validateProject = (data: any) => {
  const { error, value } = createProjectSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
};

export const validateProjectUpdate = (data: any) => {
  const { error, value } = updateProjectSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
};
