const questions = async (parent, args, ctx, info) => {
  const { userId } = ctx.request;
  const { limit, offset = 0 } = args;

  if (args.filter === 'My BookMarked') {
    return ctx.db.query.questions(
      {
        where: {
          bookMark_some: { markedBy: { id: userId } }
        }
      },
      info
    );
  }

  if (args.filter === 'my') {
    if (!userId) {
      throw new Error('you must be signed in!');
    }
    return ctx.db.query.questions(
      {
        where: {
          askedBy_some: { id: userId }
        }
      },
      info
    );
  }

  if (args.filter === 'all') {
    let questions = await ctx.db.query.questions(
      {
        where: {
          approval: true
        }
      },
      info
    );
    if (limit) {
      questions = questions.filter((q, i) => i >= offset && i < offset + limit);
      return questions;
    }
    return questions;
  }

  if (args.filter === 'tags') {
    let questions = await ctx.db.query.questions(
      {
        where: {
          tags_some: { id: args.where.tags_some.id },
          approval: null || true
        }
      },
      info
    );
    if (limit) {
      questions = questions.filter((q, i) => i >= offset && i < offset + limit);
      return questions;
    }
    return questions;
  }

  if (args.filter === 'tagslist') {
    let questions = await ctx.db.query.questions(
      {
        where: {
          tags_some: { id_in: args.where.tags_some.id_in },
          approval: null || true
        }
      },
      info
    );
    if (limit) {
      questions = questions.filter((q, i) => i >= offset && i < offset + limit);
      return questions;
    }
    return questions;
  }

  if (args.filter === 'user') {
    let questions = await ctx.db.query.questions(
      {
        where: {
          askedBy_some: { id: args.where.askedBy_some.id },
          approval: null || true
        }
      },
      info
    );
    if (limit) {
      questions = questions.filter((q, i) => i >= offset && i < offset + limit);
      return questions;
    }
    return questions;
  }

  if (args.filter === 'approval') {
    return ctx.db.query.questions(
      {
        where: {
          approval: null || false
        }
      },
      info
    );
  }
};

const questionsConnection = async (parent, args, ctx, info) => {
  const { userId } = ctx.request;

  if (args.filter === 'My BookMarked') {
    if (!userId) {
      throw new Error('you must be signed in!');
    }
    return ctx.db.query.questionsConnection(
      {
        where: {
          bookMark_some: { markedBy: { id: userId } }
        }
      },
      info
    );
  }

  if (args.filter === 'my') {
    if (!userId) {
      throw new Error('you must be signed in!');
    }
    return ctx.db.query.questionsConnection(
      {
        where: {
          askedBy_some: { id: userId }
        }
      },
      info
    );
  }
  if (args.filter === 'all') {
    return ctx.db.query.questionsConnection(
      {
        where: {
          approval: true
        }
      },
      info
    );
  }

  if (args.filter === 'tags') {
    return ctx.db.query.questionsConnection(
      {
        where: { tags_some: { id: args.where.tags_some.id } }
      },
      info
    );
  }

  if (args.filter === 'user') {
    return ctx.db.query.questionsConnection(
      {
        where: { askedBy_some: { id: args.where.askedBy_some.id } }
      },
      info
    );
  }

  if (args.filter === 'approval') {
    return ctx.db.query.questionsConnection(
      {
        where: {
          approval: null || false
        }
      },
      info
    );
  }

  if (args.filter === 'tagslist') {
    return ctx.db.query.questionsConnection(
      {
        where: {
          tags_some: { id_in: args.where.tags_some.id_in },
          approval: null || true
        }
      },
      info
    );
  }
  return null;
};

const question = async (parent, args, ctx, info) => {
  const question = await ctx.db.query.question(
    {
      where: { id: args.id }
    },
    info
  );

  return question;
};

const tag = async (parent, args, ctx, info) => {
  const atag = await ctx.db.query.tag(
    {
      where: { id: args.id }
    },
    info
  );

  return atag;
};

exports.questions = questions;
exports.tag = tag;
exports.question = question;
exports.questionsConnection = questionsConnection;
