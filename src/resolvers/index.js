const Query = require("./Query");
const Mutation = require("./Mutation");
const Question = require("./Question");

const resolvers = {
  Query,
  Mutation,
  Node: {
    __resolveType() {
      return null;
    }
  },
  Question
};

module.exports = resolvers;
