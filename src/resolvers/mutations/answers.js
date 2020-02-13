const { hasPermission, containsProfanity } = require('../../utils.js');
const {
  transport,
  makeANiceEmail,
  answeredQuestion
} = require('../../mail.js');
const { differenceInDays } = require('date-fns');
const _ = require('lodash');

const createAnswer = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const newAnswer = await ctx.db.mutation.createAnswer({
    data: {
      body: args.body,
      approval: args.approval,
      answeredBy: { connect: { id: ctx.request.userId } },
      answeredTo: { connect: { id: args.questionId } }
    }
  });

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
    data: { points: currentUser.points + 15 }
  });

  const mailRes = await transport.sendMail({
    from: 'jmcintosh@entra.io',
    to: 'jmcintosh@entra.io',
    subject: 'New Answer!',
    html: answeredQuestion(`${ctx.request.userId}`, `${args.body}`)
  });
  return newAnswer;
};

const createAnswerVote = async function(parent, args, ctx, info) {
  let answerVote;
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const votes = await ctx.db.query.answerVotes({
    where: {
      votedBy: { id: ctx.request.userId },
      votedAnswer: { id: args.answerId }
    }
  });
  const answer = await ctx.db.query.answer(
    {
      where: { id: args.answerId }
    },
    `{ id
      answeredBy { id, points }

    }`
  );

  if (votes.length === 0) {
    answerVote = await ctx.db.mutation.createAnswerVote({
      data: {
        vote: args.vote,
        // This is how to create a relationship between the Item and the User
        votedBy: {
          connect: {
            id: ctx.request.userId
          }
        },
        votedAnswer: {
          connect: {
            id: args.answerId
          }
        }
      }
    });
  } else {
    answerVote = await ctx.db.mutation.updateAnswerVote({
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
        where: { id: answer.answeredBy.id },
        data: { points: answer.answeredBy.points + 2 }
      });
    }
    if (args.vote === 'down') {
      const res = await ctx.db.mutation.updateUser({
        where: { id: answer.answeredBy.id },
        data: { points: answer.answeredBy.points - 2 }
      });
    }
  } else {
    const voteExist = votes[0].vote === args.vote;
    if (!voteExist) {
      if (args.vote === 'up') {
        const res = await ctx.db.mutation.updateUser({
          where: { id: answer.answeredBy.id },
          data: { points: answer.answeredBy.points + 2 }
        });
      }
      if (args.vote === 'down') {
        const res = await ctx.db.mutation.updateUser({
          where: { id: answer.answeredBy.id },
          data: { points: answer.answeredBy.points - 2 }
        });
      }
    }
  }

  return answerVote;
};

const createTag = async function(parent, args, ctx, info) {
  const name = args.name.trim().toLowerCase();
  const exists = await ctx.db.query.tag({ where: { name } });

  if (exists) {
    throw new Error('Tag already exists');
  }

  if (name.length < 2) {
    throw new Error('Tag should have alteast 2 characters');
  }

  if (containsProfanity(name)) {
    throw new Error(
      `Sorry, the word ${name} goes against our code of conduct.`
    );
  }

  return ctx.db.mutation.createTag(
    {
      data: {
        name: name
      }
    },
    info
  );
};

const updateAnswer = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const answer = await ctx.db.query.answer(
    {
      where: { id: args.id }
    },
    `{ id body
      selected
      createdAt
      answerVote { id }
      answeredBy { id }}`
  );

  const ownsAnswer = answer.answeredBy.id === ctx.request.userId;

  const hasPermissions = ctx.request.user.permissions.some(permission =>
    ['ADMIN', 'MODERATOR'].includes(permission)
  );

  if (hasPermissions) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateAnswer(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  }

  if (!ownsAnswer && !hasPermissions) {
    throw new Error("You don't have permission to do that!");
  }

  if (answer.selected) {
    throw new Error("Can't edit selected answer");
  }

  const days = differenceInDays(new Date(), answer.createdAt);
  if (days >= 2) {
    throw new Error("Can't edit answers older than 2 days");
  }

  // first take a copy of the updates
  const updates = { ...args };
  // remove the ID from the updates
  delete updates.id;
  // run the update method
  return ctx.db.mutation.updateAnswer(
    {
      data: updates,
      where: {
        id: args.id
      }
    },
    info
  );
};

const selectAnswer = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }
  const answer = await ctx.db.query.answer(
    {
      where: {
        id: args.id
      }
    },
    `{ id body answeredBy { id, points } answeredTo { id, bountyPoints, askedBy { id, points }}}`
  );

  const bountyPoints = answer.answeredTo[0].bountyPoints;
  const questionId = answer.answeredTo[0].id;
  const selectedUserPoints = answer.answeredBy.points;
  const selectedUserId = answer.answeredBy.id;
  const questionUser = answer.answeredTo[0].askedBy[0];

  if (answer.answeredTo[0].askedBy[0].id !== ctx.request.userId) {
    throw new Error('Answer can be approved only by question author');
  }

  // Clear previously selected answers
  await ctx.db.mutation.updateManyAnswers({
    data: { selected: false },
    where: {
      answeredTo_some: { id: answer.answeredTo[0].id },
      selected: true
    }
  });

  const res = await ctx.db.mutation.updateUser({
    where: { id: questionUser.id },
    data: { points: questionUser.points + 5 }
  });

  if (bountyPoints !== null) {
    const resSelected = await ctx.db.mutation.updateUser({
      where: { id: selectedUserId },
      data: { points: selectedUserPoints + 30 + bountyPoints }
    });

    const resQuestion = await ctx.db.mutation.updateQuestion({
      where: { id: questionId },
      data: { bountyPoints: null }
    });
  } else {
    const resSelected = await ctx.db.mutation.updateUser({
      where: { id: selectedUserId },
      data: { points: selectedUserPoints + 30 }
    });
  }

  return ctx.db.mutation.updateAnswer(
    {
      data: {
        selected: true
      },
      where: {
        id: args.id
      }
    },
    info
  );
};

const deleteAnswer = async function(parent, args, ctx, info) {
  const where = { id: args.id };

  const answer = await ctx.db.query.answer(
    {
      where: { id: args.id }
    },
    `{ id body
      selected
      createdAt
      answerVote { id }
      answeredBy { id }}`
  );

  if (!answer) {
    throw new Error('Answer already deleted');
  }

  const ownsAnswer = answer.answeredBy.id === ctx.request.userId;

  if (!ownsAnswer) {
    throw new Error("You don't have permission to do that!");
  }

  if (answer.selected) {
    throw new Error("Can't delete selected answer");
  }

  const days = differenceInDays(new Date(), answer.createdAt);
  if (days >= 2) {
    throw new Error("Can't delete answers older than 2 days");
  }

  // 3. Delete it!

  await ctx.db.mutation.deleteManyAnswerVotes(
    {
      where: { votedAnswer: { id: args.id } }
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
    data: { points: currentUser.points - 15 }
  });

  return ctx.db.mutation.deleteAnswer({ where }, info);
};

exports.createAnswer = createAnswer;
exports.createAnswerVote = createAnswerVote;
exports.createTag = createTag;
exports.updateAnswer = updateAnswer;
exports.selectAnswer = selectAnswer;
exports.deleteAnswer = deleteAnswer;
