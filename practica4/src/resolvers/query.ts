import { slotsCollection } from "../db/dbconnection.ts";
import { ObjectId } from "mongo";
import { Slot } from "../types.ts";

export const Query = {
  availableSlots: async (_:unknown, params:{year: number, month: number}): Promise<Slot[]> => {
    const slots: Slot[] = await slotsCollection
          .find({
            year: params.year,
            month: params.month,
            available: true,
          })
          .toArray();
    return slots;      
  }
};
