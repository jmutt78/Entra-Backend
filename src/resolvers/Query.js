const { forwardTo } = require("prisma-binding");

const Query = {
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  user(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },

  async questions(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("you must be signed in!");
    }

    return ctx.db.query.questions(
      {
        where: {
          askedBy_some: { id: userId }
        }
      },
      info
    );
  },

  tags: forwardTo("db"),
  questionsConnection: forwardTo("db"),
  question: forwardTo("db")
};

module.exports = Query;
