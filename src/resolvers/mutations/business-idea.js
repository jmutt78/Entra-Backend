const { transport, makeANiceEmail } = require('../../mail.js');

const createBusinessIdea = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const businessIdea = await ctx.db.mutation.createBusinessIdea(
    {
      data: {
        status: false,
        createdBy: {
          connect: {
            id: ctx.request.userId
          }
        },

        ...args
      }
    },
    info
  );

  const mailRes = await transport.sendMail({
    from: 'jmcintosh@entra.io',
    to: 'jmcintosh@entra.io',
    subject: 'New business Idea!',
    html: makeANiceEmail(`${ctx.request.userId}`, `${args.idea}`)
  });

  return businessIdea;
};

const deleteBusinessIdea = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const where = { id: args.id };

  const businessIdea = await ctx.db.query.businessIdea(
    {
      where: { id: args.id }
    },
    `{ id
            createdAt
            createdBy { id }}`
  );
  if (!businessIdea) {
    throw new Error('Idea already deleted');
  }
  await ctx.db.mutation.deleteManyBusinessIdeaVotes(
    {
      where: { votedBusinessIdea: { id: args.id } }
    },
    null
  );

  return ctx.db.mutation.deleteBusinessIdea({ where }, info);
};

const updateBusinessIdea = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const idea = await ctx.db.query.businessIdea(
    {
      where: { id: args.id }
    },
    `{ id
            createdBy { id }}`
  );

  const hasPermissions = ctx.request.user.permissions.some(permission =>
    ['ADMIN', 'MODERATOR'].includes(permission)
  );
  const ownsIdea = idea.createdBy.id === ctx.request.userId;

  if (!ownsIdea && !hasPermissions) {
    throw new Error("You don't have permission to do that!");
  }

  const updates = {
    ...args
  };
  // remove the ID from the updates
  delete updates.id;
  // run the update method
  return ctx.db.mutation.updateBusinessIdea(
    {
      data: updates,

      where: {
        id: args.id
      }
    },
    info
  );
};

const createBusinessIdeaVote = async function(parent, args, ctx, info) {
  let ideaVote;
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }
  const votes = await ctx.db.query.businessIdeaVotes({
    where: {
      votedBy: { id: ctx.request.userId },
      votedBusinessIdea: { id: args.ideaId }
    }
  });

  if (votes.length === 0) {
    ideaVote = await ctx.db.mutation.createBusinessIdeaVote({
      data: {
        vote: args.vote,
        // This is how to create a relationship between the Item and the User
        votedBy: {
          connect: {
            id: ctx.request.userId
          }
        },
        votedBusinessIdea: {
          connect: {
            id: args.ideaId
          }
        }
      }
    });
  } else {
    ideaVote = await ctx.db.mutation.updateBusinessIdeaVote({
      where: {
        id: votes[0].id
      },
      data: {
        vote: args.vote
      }
    });
  }

  return ideaVote;
};

exports.createBusinessIdea = createBusinessIdea;
exports.deleteBusinessIdea = deleteBusinessIdea;
exports.updateBusinessIdea = updateBusinessIdea;
exports.createBusinessIdeaVote = createBusinessIdeaVote;
