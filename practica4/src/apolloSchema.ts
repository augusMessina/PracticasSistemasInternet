export const typeDefs = `
type Slot{
  day: Int!
  month: Int!
  year: Int!
  hour: Int!
  available: Boolean!
  dni: String
}
type Response{
  message: String!
  slot: Slot
}
type Query{
    getSlots: [Slot!]!
    availableSlots(year: Int!, month: Int!): [Slot!]!
}
type Mutation{
  removeSlot(year: Int!, month: Int!, day: Int!, hour: Int!): Response!
  addSlot(year: Int!, month: Int!, day: Int!, hour: Int!): Response!
  bookSlot(year: Int!, month: Int!, day: Int!, hour: Int!, dni: String!): Response!
}`;
