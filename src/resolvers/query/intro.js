const intro = async (parent, args, ctx, info) => {
  const introPost = await ctx.db.query.intro(
    {
      where: { id: args.id }
    },
    info
  );

  return introPost;
};

const introes = async (parent, args, ctx, info) => {
  const { userId } = ctx.request;
  const { limit, offset = 0 } = args;

  if (args.filter === 'all') {
    return ctx.db.query.introes(
      {
        where: {
          approval: true
        }
      },
      info
    );
  }

  if (args.filter === 'approval') {
    return ctx.db.query.introes(
      {
        where: {
          approval: null || false
        }
      },
      info
    );
  }
};

const introComments = async (parent, args, ctx, info) => {
  const { userId } = ctx.request;

  if (args.filter === 'approval') {
    return ctx.db.query.introComments(
      {
        where: {
          approval: null || false
        }
      },
      info
    );
  }

  return null;
};

exports.intro = intro;
exports.introes = introes;
exports.introComments = introComments;
