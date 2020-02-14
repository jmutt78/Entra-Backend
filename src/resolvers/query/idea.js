const businessIdea = async (parent, args, ctx, info) => {
  const bIdea = await ctx.db.query.businessIdea(
    {
      where: { id: args.id }
    },
    info
  );

  return bIdea;
};

const businessIdeas = async (parent, args, ctx, info) => {
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
};

exports.businessIdeas = businessIdeas;
exports.businessIdea = businessIdea;
