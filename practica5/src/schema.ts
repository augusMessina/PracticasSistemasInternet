export const typeDefs = `
  scalar Date
  type Team {
    id: ID!
    name: String!
    matches: [Match!]!
    players: [Player!]!
    goals_for: Int!
    goals_against: Int!
    classified: Boolean!
    updatedBy: String!
  }

  enum MatchStatus {
    PENDING
    FINISHED
    PLAYING
  }

  type Match {
    id: ID!
    team1: Team!
    team2: Team!
    goals_team1: Int!
    goals_team2: Int!
    date: String!
    status: MatchStatus!
    updatedBy: String!
  }

  type Player {
    id: ID!
    name: String!
    team: Team
    updatedBy: String!
  }

  type User {
    id: String!
    username: String!
    password: String
    token: String
  }

  type Query {
    teams(classified: Boolean): [Team!]!
    team(id: ID!): Team!
    matches(status: MatchStatus, team: ID, date: Date): [Match!]!
    match(id: ID!): Match!
    players(team_id: ID): [Player!]!
    player(id: ID!): Player!
  }

  type Mutation {
    register(username: String!, password: String!, key: String!): User!
    login(username: String!, password: String!): String!

    createTeam(name: String!, players: [ID!]!, classified: Boolean!, username: String!, token: String!): Team!
    updateTeam(id: ID!, players: [ID!], classified: Boolean, username: String!, token: String!): Team!
    deleteTeam(id: ID!, username: String!, token: String!): Team!

    createMatch(
      team1: ID!
      team2: ID!
      goals_team1: Int!
      goals_team2: Int!
      date: String!
      status: MatchStatus!
      username: String!
      token: String!
    ): Match!

    updateMatch(
      id: ID!
      goals_team1: Int!
      goals_team2: Int!
      status: MatchStatus!
      username: String!
      token: String!
    ): Match!

    deleteMatch(id: ID!, username: String!, token: String!): Match!

    createPlayer(name: String!, username: String!, token: String!): Player!
    deletePlayer(id: ID!, username: String!, token: String!): Player!
  }
`;
