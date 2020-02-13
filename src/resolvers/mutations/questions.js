const {
  transport,
  makeANiceEmail,
  answeredQuestion
} = require('../../mail.js');
const { differenceInDays } = require('date-fns');
const _ = require('lodash');

const createQuestion = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const question = await ctx.db.mutation.createQuestion(
    {
      data: {
        // This is how to create a relationship between the Item and the User
        askedBy: {
          connect: {
            id: ctx.request.userId
          }
        },

        ...args,
        tags: { connect: args.tags }
      }
    },
    info
  );

  const currentUser = await ctx.db.query.user(
    {
      where: {
        id: ctx.request.userId
      }
    },
    `{ id
      points
  }`
  );

  const res = await ctx.db.mutation.updateUser({
    where: { id: currentUser.id },
    data: { points: currentUser.points + 30 }
  });

  const mailRes = await transport.sendMail({
    from: 'jmcintosh@entra.io',
    to: 'jmcintosh@entra.io',
    subject: 'New Question!',
    html: makeANiceEmail(`${ctx.request.userId}`, `${args.title}`)
  });

  return question;
};

const createQuestionView = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }
  const views = await ctx.db.query.questionViews({
    where: {
      viewedBy: { id: ctx.request.userId },
      viewedQuestion: { id: args.questionId }
    }
  });

  const question = await ctx.db.query.question(
    {
      where: { id: args.questionId }
    },
    `{ id
      createdAt
      askedBy { id, points }

    }`
  );

  if (views.length === 0) {
    const questionView = await ctx.db.mutation.createQuestionView({
      data: {
        // This is how to create a relationship between the Item and the User
        viewedBy: {
          connect: {
            id: ctx.request.userId
          }
        },
        viewedQuestion: {
          connect: {
            id: args.questionId
          }
        }
      }
    });
    const res = await ctx.db.mutation.updateUser({
      where: { id: question.askedBy[0].id },
      data: { points: question.askedBy[0].points + 1 }
    });
  }

  return true;
};

const createQuestionVote = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }
  const votes = await ctx.db.query.questionVotes({
    where: {
      votedBy: { id: ctx.request.userId },
      votedQuestion: { id: args.questionId }
    }
  });

  const question = await ctx.db.query.question(
    {
      where: { id: args.questionId }
    },
    `{ id
      createdAt
      askedBy { id, points }

    }`
  );

  if (votes.length === 0) {
    const questionVote = await ctx.db.mutation.createQuestionVote({
      data: {
        vote: args.vote,
        // This is how to create a relationship between the Item and the User
        votedBy: {
          connect: {
            id: ctx.request.userId
          }
        },
        votedQuestion: {
          connect: {
            id: args.questionId
          }
        }
      }
    });
  } else {
    const questionVote = await ctx.db.mutation.updateQuestionVote({
      where: {
        id: votes[0].id
      },
      data: {
        vote: args.vote
      }
    });
  }

  if (votes.length === 0) {
    if (args.vote === 'up') {
      const res = await ctx.db.mutation.updateUser({
        where: { id: question.askedBy[0].id },
        data: { points: question.askedBy[0].points + 2 }
      });
    }
    if (args.vote === 'down') {
      const res = await ctx.db.mutation.updateUser({
        where: { id: question.askedBy[0].id },
        data: { points: question.askedBy[0].points - 2 }
      });
    }
  } else {
    const voteExist = votes[0].vote === args.vote;

    if (!voteExist) {
      if (args.vote === 'up') {
        const res = await ctx.db.mutation.updateUser({
          where: { id: question.askedBy[0].id },
          data: { points: question.askedBy[0].points + 2 }
        });
      }
      if (args.vote === 'down') {
        const res = await ctx.db.mutation.updateUser({
          where: { id: question.askedBy[0].id },
          data: { points: question.askedBy[0].points - 2 }
        });
      }
    }
  }

  return true;
};

const deleteQuestion = async function(parent, args, ctx, info) {
  const where = { id: args.id };

  const question = await ctx.db.query.question(
    {
      where: { id: args.id }
    },
    `{ id
      createdAt
      askedBy { id }}`
  );
  if (!question) {
    throw new Error('Question already deleted');
  }

  const ownsQuestion = question.askedBy[0].id === ctx.request.userId;

  if (!ownsQuestion) {
    throw new Error("You don't have permission to do that!");
  }

  const answersResult = await ctx.db.query.answersConnection(
    {
      where: {
        answeredTo_some: { id: args.id }
      }
    },
    '{ aggregate { count }}'
  );
  if (answersResult.aggregate.count > 0) {
    throw new Error("Can't delete question with answers");
  }

  const days = differenceInDays(new Date(), question.createdAt);
  if (days >= 1) {
    throw new Error("Can't delete question older than 1 day");
  }

  // 3. Delete it!

  await ctx.db.mutation.deleteManyQuestionVotes(
    {
      where: { votedQuestion: { id: args.id } }
    },
    null
  );
  await ctx.db.mutation.deleteManyQuestionViews(
    {
      where: { viewedQuestion: { id: args.id } }
    },
    null
  );

  const currentUser = await ctx.db.query.user(
    {
      where: {
        id: ctx.request.userId
      }
    },
    `{ id
      points
  }`
  );

  const res = await ctx.db.mutation.updateUser({
    where: { id: currentUser.id },
    data: { points: currentUser.points - 30 }
  });

  return ctx.db.mutation.deleteQuestion({ where }, info);
};

const updateQuestion = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }
  const question = await ctx.db.query.question(
    {
      where: { id: args.id }
    },
    `{ id
      createdAt
      tags { name }
      askedBy { id }}`
  );

  const deletedTags = args.tags
    ? _.differenceBy(question.tags, args.tags, tag => tag.name)
    : [];
  const hasPermissions = ctx.request.user.permissions.some(permission =>
    ['ADMIN', 'MODERATOR'].includes(permission)
  );

  if (hasPermissions) {
    const updates = {
      ...args,
      tags: { disconnect: deletedTags, connect: args.tags }
    };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateQuestion(
      {
        data: updates,

        where: {
          id: args.id
        }
      },
      info
    );
  }

  const ownsQuestion = question.askedBy[0].id === ctx.request.userId;

  if (!ownsQuestion && !hasPermissions) {
    throw new Error("You don't have permission to do that!");
  }

  const answersResult = await ctx.db.query.answersConnection(
    {
      where: {
        answeredTo_some: { id: args.id }
      }
    },
    '{ aggregate { count }}'
  );
  if (answersResult.aggregate.count > 0) {
    throw new Error("Can't edit question with answers");
  }

  const days = differenceInDays(new Date(), question.createdAt);
  if (days >= 1) {
    throw new Error("Can't edit question older than 1 day");
  }

  // first take a copy of the updates
  const updates = {
    ...args,
    tags: { disconnect: deletedTags, connect: args.tags }
  };
  // remove the ID from the updates
  delete updates.id;
  // run the update method
  return ctx.db.mutation.updateQuestion(
    {
      data: updates,

      where: {
        id: args.id
      }
    },
    info
  );
};

const createBounty = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }
  const question = await ctx.db.query.question(
    {
      where: { id: args.id }
    },
    `{ id
      createdAt
      bountyPoints
      askedBy { id }}`
  );

  const currentUser = await ctx.db.query.user(
    {
      where: {
        id: ctx.request.userId
      }
    },
    `{ id
      points
  }`
  );

  const ownsQuestion = question.askedBy[0].id === ctx.request.userId;
  const hasPermissions = ctx.request.user.permissions.some(permission =>
    ['ADMIN', 'MODERATOR'].includes(permission)
  );

  if (!ownsQuestion && !hasPermissions) {
    throw new Error("You don't have permission to do that!");
  }
  console.log(currentUser.points < args.bountyPoints);
  if (currentUser.points < args.bountyPoints) {
    throw new Error("You don't have enough points!");
  }

  const res = await ctx.db.mutation.updateUser({
    where: { id: currentUser.id },
    data: { points: currentUser.points - args.bountyPoints }
  });

  const updates = {
    ...args
  };
  // remove the ID from the updates
  delete updates.id;
  // run the update method
  return ctx.db.mutation.updateQuestion(
    {
      data: updates,

      where: {
        id: args.id
      }
    },
    info
  );
};

exports.createQuestion = createQuestion;
exports.createQuestionView = createQuestionView;
exports.createQuestionVote = createQuestionVote;
exports.deleteQuestion = deleteQuestion;
exports.updateQuestion = updateQuestion;
exports.createBounty = createBounty;
