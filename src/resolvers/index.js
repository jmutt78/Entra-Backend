const Query = require("./Query");
const Mutation = require("./Mutation");
const Question = require("./Question");
const User = require("./User");
const Badges = require("./Badges");

const resolvers = {
  Query,
  Mutation,
  Node: {
    __resolveType() {
      return null;
    }
  },
  Question,
  User,
  Badges
};

module.exports = resolvers;
