import {ApolloServer} from "npm:@apollo/server@^4.1"
import {startStandaloneServer} from "npm:@apollo/server@^4.1/standalone";

import { Query } from "./resolvers/query.ts";
import { Mutation } from "./resolvers/mutation.ts";
import { Match } from "./resolvers/match.ts";
import { Player } from "./resolvers/player.ts";
import { Team } from "./resolvers/team.ts";
import { typeDefs } from "./schema.ts";

const resolvers = {
  Query,
  Mutation,
  Match,
  Player,
  Team,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  includeStacktraceInErrorResponses : false
})

const {url} = await startStandaloneServer(server,{
  listen: {port: 7777},
})
console.log(`Server running on: http://localhost:7777`);
