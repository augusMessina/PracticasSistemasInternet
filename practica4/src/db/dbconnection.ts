import { SlotSchema } from "./schema.ts";
import {
  MongoClient
} from "mongo";
import {config} from "https://deno.land/x/dotenv/mod.ts";

const client = new MongoClient()
//usuario: Augus, password: NebrijaAugus
await client.connect(
  `mongodb+srv://${config().USER}:${config().PASSWORD}@cluster0.bffv5pw.mongodb.net/?authMechanism=SCRAM-SHA-1`,
);

export const db = client.database("Cluster0");

export const slotsCollection = db.collection<SlotSchema>("Slots");