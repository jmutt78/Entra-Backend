const answers = async (parent, args, ctx, info) => {
  const { userId } = ctx.request;

  if (args.filter === 'selected') {
    return ctx.db.query.answers(
      {
        where: {
          selected: true,
          answeredBy: { id: args.where.answeredBy.id },
          approval: null || true
        }
      },
      info
    );
  }

  if (args.filter === 'approval') {
    return ctx.db.query.answers(
      {
        where: {
          approval: null || false
        }
      },
      info
    );
  }

  if (args.filter === 'user') {
    return ctx.db.query.answers(
      {
        where: {
          answeredBy: { id: args.where.answeredBy.id },
          approval: null || true
        }
      },
      info
    );
  }

  if (args.filter === 'my') {
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
};

const answersConnection = async (parent, args, ctx, info) => {
  const { userId } = ctx.request;
  if (args.filter === 'selected') {
    return ctx.db.query.answersConnection(
      {
        where: {
          selected: true,
          answeredBy: { id: args.where.answeredBy.id }
        }
      },
      info
    );
  }

  if (args.filter === 'approval') {
    return ctx.db.query.answersConnection(
      {
        where: {
          approval: null || false
        }
      },
      info
    );
  }

  if (args.filter === 'user') {
    return ctx.db.query.answersConnection(
      {
        where: { answeredBy: { id: args.where.answeredBy.id } }
      },
      info
    );
  }

  if (args.filter === 'my') {
    return ctx.db.query.answersConnection(
      {
        where: {
          answeredBy: { id: userId }
        }
      },
      info
    );
  }

  return null;
};

const answer = async (parent, args, ctx, info) => {
  const answer = await ctx.db.query.answer(
    {
      where: { id: args.id }
    },
    info
  );

  return answer;
};

exports.answers = answers;
exports.answersConnection = answersConnection;
exports.answer = answer;
