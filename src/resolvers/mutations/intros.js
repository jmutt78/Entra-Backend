const {
  transport,
  makeANiceEmail,
  answeredQuestion
} = require('../../mail.js');
const { differenceInDays } = require('date-fns');

const createIntro = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const intro = await ctx.db.mutation.createIntro(
    {
      data: {
        postedBy: {
          connect: {
            id: ctx.request.userId
          }
        },

        ...args
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

  //add a contraint for only one intro through querying the currentUser above.

  const res = await ctx.db.mutation.updateUser({
    where: { id: currentUser.id },
    data: { points: currentUser.points + 50 }
  });

  const mailRes = await transport.sendMail({
    from: 'jmcintosh@entra.io',
    to: 'jmcintosh@entra.io',
    subject: 'New Intro!',
    html: makeANiceEmail(`${ctx.request.userId}`, `${args.title}`)
  });

  return intro;
};

//----------------------Comments--------------------------------------//

const createIntroComment = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const newComment = await ctx.db.mutation.createIntroComment({
    data: {
      body: args.body,
      approval: args.approval,
      commentBy: { connect: { id: ctx.request.userId } },
      commentTo: { connect: { id: args.introId } }
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
    data: { points: currentUser.points + 5 }
  });

  // const mailRes = await transport.sendMail({
  //   from: 'jmcintosh@entra.io',
  //   to: 'jmcintosh@entra.io',
  //   subject: 'New Comment!',
  //   html: answeredQuestion(`${ctx.request.userId}`, `${args.body}`)
  // });
  return newComment;
};

const updateIntroComment = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const comment = await ctx.db.query.introComment(
    {
      where: { id: args.id }
    },
    `{ id body
      createdAt
      commentBy { id }}`
  );

  const ownsComment = comment.commentBy.id === ctx.request.userId;

  const hasPermissions = ctx.request.user.permissions.some(permission =>
    ['ADMIN', 'MODERATOR'].includes(permission)
  );

  if (hasPermissions) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateIntroComment(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  }

  if (!ownsComment && !hasPermissions) {
    throw new Error("You don't have permission to do that!");
  }

  const days = differenceInDays(new Date(), comment.createdAt);
  if (days >= 2) {
    throw new Error("Can't edit answers older than 2 days");
  }

  // first take a copy of the updates
  const updates = { ...args };
  // remove the ID from the updates
  delete updates.id;
  // run the update method
  return ctx.db.mutation.updateIntroComment(
    {
      data: updates,
      where: {
        id: args.id
      }
    },
    info
  );
};

const deleteIntroComment = async function(parent, args, ctx, info) {
  const where = { id: args.id };

  const comment = await ctx.db.query.introComment(
    {
      where: { id: args.id }
    },
    `{ id body
      createdAt
      commentBy { id }}`
  );

  if (!comment) {
    throw new Error('Answer already deleted');
  }

  const ownsComment = comment.commentBy.id === ctx.request.userId;

  if (!ownsComment) {
    throw new Error("You don't have permission to do that!");
  }

  const days = differenceInDays(new Date(), comment.createdAt);
  if (days >= 2) {
    throw new Error("Can't delete answers older than 2 days");
  }

  // 3. Delete it!

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
    data: { points: currentUser.points - 5 }
  });

  return ctx.db.mutation.deleteIntroComment({ where }, info);
};

exports.createIntro = createIntro;
exports.createIntroComment = createIntroComment;
exports.updateIntroComment = updateIntroComment;
exports.deleteIntroComment = deleteIntroComment;
