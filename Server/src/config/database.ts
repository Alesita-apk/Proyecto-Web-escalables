import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env['MONGODB_URI'];
  if (!uri) {
    throw new Error('La ruta de MONGODB_URI es obligatoria');
  }
  await mongoose.connect(uri);
};
