import { CounterModel } from '../models/site.model.ts';

export const nextId = async (name: string): Promise<number> => {
  const counter = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { secuencia: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return counter.secuencia;
};
