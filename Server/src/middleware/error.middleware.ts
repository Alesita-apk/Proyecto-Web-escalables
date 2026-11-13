import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    res.status(409).json({ message: 'El registro ya existe.' });
    return;
  }
  console.error(error);
  res.status(500).json({ message: 'Ocurrió un error interno.' });
};
