import { MongoClient, Database } from "mongo";

import {config} from "https://deno.land/x/dotenv/mod.ts";

import { MatchSchema, PlayerSchema, TeamSchema, UserSchema } from "./schema.ts";

const client = new MongoClient()
//usuario: Augus, password: NebrijaAugus
await client.connect(
  `mongodb+srv://${config().USER}:${config().PASSWORD}@cluster0.bffv5pw.mongodb.net/?authMechanism=SCRAM-SHA-1`,
);

export const db = client.database("Cluster0");

export const MatchCollection = db.collection<MatchSchema>("matches");
export const TeamCollection = db.collection<TeamSchema>("teams");
export const PlayerCollection = db.collection<PlayerSchema>("players");

export const UsersCollection = db.collection<UserSchema>("users");