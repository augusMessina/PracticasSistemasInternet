import { SlotSchema } from "./schemas.ts";
import {
  MongoClient
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import {config} from "https://deno.land/x/dotenv/mod.ts";

const client = new MongoClient()
//usuario: Augus, password: NebrijaAugus
await client.connect(
  `mongodb+srv://${config().USER}:${config().PASSWORD}@cluster0.bffv5pw.mongodb.net/?authMechanism=SCRAM-SHA-1`,
);

export const db = client.database("Cluster0");

export const slotsCollection = db.collection<SlotSchema>("Slots");
