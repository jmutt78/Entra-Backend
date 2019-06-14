const Query = require("./Query");
const Mutation = require("./Mutation");
// import Question from "./Question";

const resolvers = {
  Query,
  Mutation,
  Node: {
    __resolveType() {
      return null;
    }
  }
  // Question
};

module.exports = resolvers;
