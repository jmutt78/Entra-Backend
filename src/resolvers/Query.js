const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

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
  async users(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("you must be signed in!");
    }

    // 2. Check if the user has the permissions to query all the users
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);

    // 2. if they do, query all the users!
    return ctx.db.query.users({}, info);
  },

  async questions(parent, args, ctx, info) {
    if (args.filter === "all") {
      return ctx.db.query.questions(
        {
          where: {
            approval: true
          }
        },
        info
      );
    }

    if (args.filter === "approval") {
      return ctx.db.query.questions(
        {
          where: {
            approval: null
          }
        },
        info
      );
    }
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("you must be signed in!");
    }
    if (args.filter === "my") {
      return ctx.db.query.questions(
        {
          where: {
            askedBy_some: { id: userId }
          }
        },
        info
      );
    }
    return null;
  },

  async answers(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("you must be signed in!");
    }

    if (args.filter === "approval") {
      return ctx.db.query.answers(
        {
          where: {
            approval: null
          }
        },
        info
      );
    }

    if (args.filter === "my") {
      return ctx.db.query.answers(
        {
          where: {
            answeredBy: { id: userId }
          }
        },
        info
      );
    }
    return null;
  },

  tags: forwardTo("db"),
  async questionsConnection(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("you must be signed in!");
    }

    return ctx.db.query.questionsConnection(
      {
        where: {
          askedBy_some: { id: userId }
        }
      },
      info
    );
  },

  async answer(parent, args, ctx, info) {
    const answer = await ctx.db.query.answer(
      {
        where: { id: args.id }
      },
      info
    );

    return answer;
  },

  async question(parent, args, ctx, info) {
    const question = await ctx.db.query.question(
      {
        where: { id: args.id }
      },
      info
    );

    return question;
  }
};

module.exports = Query;
