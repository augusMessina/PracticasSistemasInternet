import { ObjectId } from "mongo";
import { MatchCollection, PlayerCollection, TeamCollection, UsersCollection } from "../db/db.ts";
import { MatchSchema, PlayerSchema, TeamSchema, UserSchema } from "../db/schema.ts";
import { MatchStatus, User } from "../types.ts";
import * as bcrypt from "bcrypt";
import { createJWT } from "../lib/jwt.ts";
import {config} from "https://deno.land/x/dotenv/mod.ts";

const checkToken = async (username:string, token: string): Promise<string|undefined> =>{
  const user: UserSchema | undefined = await UsersCollection.findOne({
    username: username,
  });
  if (!user) {
    throw new Error("User does not exist");
  }
  if(user?.token === token){
    return user._id;
  }
}

export const Mutation = {
  register: async (
    parent: unknown,
    args: {
      username: string;
      password: string;
      key: string
    }
  ): Promise<User & { token: string }> => {
    try {
      if(args.key != config().JWT_SECRET){
        throw new Error("Incorrect key.");
      }
      const user: UserSchema | undefined = await UsersCollection.findOne({
        username: args.username,
      });
      if (user) {
        throw new Error("User already exists");
      }
      const hashedPassword = await bcrypt.hash(args.password);
      const _id = new ObjectId();
      const token = await createJWT(
        {
          username: args.username,
          id: _id.toString(),
        },
        config().JWT_SECRET!
      );
      const newUser: UserSchema = {
        _id,
        username: args.username,
        password: hashedPassword,
        token: token
      };
      await UsersCollection.insertOne(newUser);
      return {
        id: _id,
        username: args.username,
        password: hashedPassword,
        token,
      };
    } catch (e) {
      throw new Error(e);
    }
  },
  login: async (
    parent: unknown,
    args: {
      username: string;
      password: string;
    }
  ): Promise<string> => {
    try {
      const user: UserSchema | undefined = await UsersCollection.findOne({
        username: args.username,
      });
      if (!user) {
        throw new Error("User does not exist");
      }
      const validPassword = await bcrypt.compare(args.password, user.password);
      if (!validPassword) {
        throw new Error("Invalid password");
      }
      const token = await createJWT(
        {
          username: user.username,
          id: user._id.toString(),
        },
        config().JWT_SECRET!
      );
      await UsersCollection.updateOne(
        { username: user.username },
        { $set: { token } }
      );
      return token;
    } catch (e) {
      throw new Error(e);
    }
  },
  createTeam: async (
    _: unknown,
    args: { name: string; players: string[]; classified: boolean
            username: string; token: string }
  ): Promise<TeamSchema> => {
    try {
      const check: string | undefined = await checkToken(args.username, args.token);
      if(!check){
        throw new Error("Invalid token.")
      }
      const { name, players, classified } = args;
      const exists = await TeamCollection.findOne({
        name,
      });
      if (exists) {
        throw new Error("Team already exists");
      }

      const _id = await TeamCollection.insertOne({
        name,
        classified,
        players: players.map((p) => new ObjectId(p)),
        updatedBy: check,
      });
      return {
        _id,
        name,
        classified,
        players: players.map((p) => new ObjectId(p)),
        updatedBy: check
      };
    } catch (e) {
      throw new Error(e);
    }
  },

  updateTeam: async (
    _: unknown,
    args: {
      id: string;
      players?: string[];
      classified?: boolean;
      username: string;
      token: string
    }
  ): Promise<TeamSchema> => {
    try {
      const check: string | undefined = await checkToken(args.username, args.token);
      if(!check){
        throw new Error("Invalid token.")
      }
      const { id, players, classified } = args;
      const _id = new ObjectId(id);
      let set = {};
      if (players) {
        set = { ...set, players: players?.map((p) => new ObjectId(p)) };
      }
      if (classified) {
        set = { ...set, classified };
      }
      const team = await TeamCollection.updateOne(
        { _id },
        {
          $set: set,
        }
      );

      if (team.matchedCount === 0) {
        throw new Error("Team not found");
      }

      return (await TeamCollection.findOne({
        _id,
      })) as TeamSchema;
    } catch (e) {
      throw new Error(e);
    }
  },
  deleteTeam: async (_: unknown, args: { id: string, username: string, token: string }): Promise<TeamSchema> => {
    try {
      const check: string | undefined = await checkToken(args.username, args.token);
      if(!check){
        throw new Error("Invalid token.")
      }
      const { id } = args;
      const _id = new ObjectId(id);
      const team = await TeamCollection.findOne({
        _id,
      });
      if (!team) {
        throw new Error("Team not found");
      }
      await TeamCollection.deleteOne({ _id });
      return team;
    } catch (e) {
      throw new Error(e);
    }
  },

  createMatch: async (
    _: unknown,
    args: {
      team1: string;
      team2: string;
      goals_team1: number;
      goals_team2: number;
      date: Date;
      status: MatchStatus;
      username: string;
      token: string;
    }
  ): Promise<MatchSchema> => {
    try {
      const check: string | undefined = await checkToken(args.username, args.token);
      if(!check){
        throw new Error("Invalid token.")
      }
      const { team1, team2, goals_team1, goals_team2, date, status } = args;
      const exists = await MatchCollection.findOne({
        team1: new ObjectId(team1),
        team2: new ObjectId(team2),
        date,
      });
      if (exists) {
        throw new Error("Match already exists");
      }

      const _id = await MatchCollection.insertOne({
        team1: new ObjectId(team1),
        team2: new ObjectId(team2),
        goals_team1,
        goals_team2,
        date,
        status,
        updatedBy: check
      });
      return {
        _id,
        team1: new ObjectId(team1),
        team2: new ObjectId(team2),
        goals_team1,
        goals_team2,
        date,
        status,
        updatedBy: check
      };
    } catch (e) {
      throw new Error(e);
    }
  },
  updateMatch: async (
    _: unknown,
    args: {
      id: string;
      goals_team1: number;
      goals_team2: number;
      status: MatchStatus;
      username: string;
      token: string
    }
  ): Promise<MatchSchema> => {
    try {
      const check: string | undefined = await checkToken(args.username, args.token);
      if(!check){
        throw new Error("Invalid token.")
      }
      const { id, goals_team1, goals_team2, status } = args;
      const _id = new ObjectId(id);
      const match = await MatchCollection.updateOne(
        {
          _id,
        },
        {
          $set: {
            goals_team1,
            goals_team2,
            status,
          },
        }
      );
      if (match.matchedCount === 0) {
        throw new Error("Match not found");
      }
      return (await MatchCollection.findOne({
        _id,
      })) as MatchSchema;
    } catch (e) {
      throw new Error(e);
    }
  },
  deleteMatch: async (
    _: unknown,
    args: { id: string, username: string, token: string }
  ): Promise<MatchSchema> => {
    try {
      const check: string | undefined = await checkToken(args.username, args.token);
      if(!check){
        throw new Error("Invalid token.")
      }
      const { id } = args;
      const _id = new ObjectId(id);
      const match = await MatchCollection.findOne({
        _id,
      });
      if (!match) {
        throw new Error("Match not found");
      }
      await MatchCollection.deleteOne({ _id });
      return match;
    } catch (e) {
      throw new Error(e);
    }
  },
  createPlayer: async (
    _: unknown,
    args: { name: string, username: string, token: string }
  ): Promise<PlayerSchema> => {
    try {
      const check: string | undefined = await checkToken(args.username, args.token);
      if(!check){
        throw new Error("Invalid token.")
      }
      const { name } = args;
      const _id = await PlayerCollection.insertOne({
        name,
        updatedBy: check
      });
      return {
        _id,
        name,
        updatedBy: check
      };
    } catch (e) {
      throw new Error(e);
    }
  },
  deletePlayer: async (
    _: unknown,
    args: { id: string, username: string, token: string }
  ): Promise<PlayerSchema> => {
    try {
      const check: string | undefined = await checkToken(args.username, args.token);
      if(!check){
        throw new Error("Invalid token.")
      }
      const { id } = args;
      const _id = new ObjectId(id);
      const player = await PlayerCollection.findOne({
        _id,
      });
      if (!player) {
        throw new Error("Player not found");
      }
      await PlayerCollection.deleteOne({
        _id,
      });
      return player;
    } catch (e) {
      throw new Error(e);
    }
  },
};
