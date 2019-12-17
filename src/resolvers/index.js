const Query = require('./Query');
const Mutation = require('./Mutation');
const Question = require('./Question');
const Answer = require('./Answer');
const User = require('./User');
const Badges = require('./Badges');
const BusinessIdea = require('./BusinessIdea');

const resolvers = {
  Query,
  Mutation,
  Node: {
    __resolveType() {
      return null;
    }
  },
  Question,
  Answer,
  User,
  Badges,
  BusinessIdea
};

module.exports = resolvers;
