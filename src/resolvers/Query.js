const { forwardTo } = require('prisma-binding');

const { searchQuestions } = require('./query/search');
const { intro, introes, introComments } = require('./query/intro');
const { me, user, users, bookMark } = require('./query/user');
const { answers, answersConnection, answer } = require('./query/answer');
const {
  questions,
  questionsConnection,
  question,
  tag
} = require('./query/question');

const Query = {
  me,
  user,
  users,
  searchQuestions,
  questions,
  questionsConnection,
  question,
  bookMark,
  tag,
  answers,
  answersConnection,
  answer,
  tags: forwardTo('db'),
  answerVote: forwardTo('db'),
  businessIdeaVote: forwardTo('db'),
  introes,
  intro,
  introComments,
  async businessIdea(parent, args, ctx, info) {
    const businessIdea = await ctx.db.query.businessIdea(
      {
        where: { id: args.id }
      },
      info
    );

    return businessIdea;
  },

  async businessIdeas(parent, args, ctx, info) {
    const { userId } = ctx.request;

    if (args.filter === 'my') {
      if (!userId) {
        throw new Error('you must be signed in!');
      }
      return ctx.db.query.businessIdeas(
        {
          where: {
            createdBy: { id: userId }
          }
        },
        info
      );
    }

    if (args.filter === 'public') {
      return ctx.db.query.businessIdeas(
        {
          where: {
            status: true
          }
        },
        info
      );
    }
  }
};

module.exports = Query;
