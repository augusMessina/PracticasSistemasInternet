import { ObjectId } from "mongo";
import { slotsCollection } from "../db/dbconnection.ts";
import { SlotSchema } from "../db/schema.ts";
import { Slot, Response } from "../types.ts";

const isValidDate = (
  year: number,
  month: number,
  day: number,
  hour: number
): boolean => {
  const date = new Date(year, month, day, hour);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day &&
    date.getHours() === hour
  );
};

export const Mutation = {
  addSlot: async (_:unknown, params:Omit<Slot, "available"> ): Promise<Response>=> {
    const { month, year, day, hour} = params;

    if (!isValidDate(year, month - 1, day, hour)) {
      return {
        message: "Date is invalid."
      }
    }

    const foundSlot = await slotsCollection.findOne({ day, month, year, hour });

    if (foundSlot) {
      if (!foundSlot.available) {
        return{
          message: "Slot not available."
        }
      } else {
        return{
          message: "Slot was already added."
        }
      }
    }

    const addingSlot: Slot = {...params, available: true};
    await slotsCollection.insertOne(addingSlot as SlotSchema);

    return{
      message: "Slot succesfully added.",
      slot: addingSlot
    }
  },
  removeSlot: async (_:unknown, params:{year:number, month:number, day:number, hour:number}): Promise<Response> => {
    const { year, month, day, hour } = params;
    const slot: SlotSchema | undefined = await slotsCollection.findOne({
      year: year,
      month: month,
      day: day,
      hour: hour,
    });
    
    if (!slot) {
      return {
        message: "Slot not found."
      }
    }
    if (!slot.available) {
      return {
        message: "Slot found but not available."
      }
    }

    await slotsCollection.deleteOne({ _id: slot._id });
    return {
      message: "Slot succesfully removed.",
      slot: slot
    }
  },
bookSlot: async(_:unknown, params:{year: number, month: number,
    day: number, hour: number, dni: string}): Promise<Response> =>{
  const { month, year, day, hour, dni} = params;

  const slot: SlotSchema | undefined = await slotsCollection.findOne({
    year: year,
    month: month,
    day: day,
    hour: hour,
    available: true
  });

  if (!slot) {
    return{
      message: "Slot not found."
    };
  }

  await slotsCollection.updateOne(
    { _id: slot._id },
    { $set: { available: false, dni } }
  );

  const { _id, ...rest } = slot;

  return{
    message: "Slot booked succesfully",
    slot: { ...rest, available: false, dni }
  }
}
};
