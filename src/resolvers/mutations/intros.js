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

  const currentUserIntro = await ctx.db.query.user(
    {
      where: {
        id: ctx.request.userId
      }
    },
    `{ id
      myIntro {
        id
      }
  }`
  );
  const hasIntro = currentUserIntro.myIntro[0];
  if (hasIntro) {
    throw new Error('You have already created an inroduction');
  }

  const intro = await ctx.db.mutation.createIntro(
    {
      data: {
        postedBy: {
          connect: {
            id: ctx.request.userId
          }
        },
        approval: false,
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

  // const mailRes = await transport.sendMail({
  //   from: 'jmcintosh@entra.io',
  //   to: 'jmcintosh@entra.io',
  //   subject: 'New Intro!',
  //   html: makeANiceEmail(`${ctx.request.userId}`, `${args.title}`)
  // });

  return intro;
};

const deleteIntro = async function(parent, args, ctx, info) {
  const where = { id: args.id };

  const intro = await ctx.db.query.intro(
    {
      where: { id: args.id }
    },
    `{ id
      createdAt
      postedBy { id }}`
  );
  if (!intro) {
    throw new Error('Intro already deleted');
  }

  const ownsIntro = intro.postedBy[0].id === ctx.request.userId;

  if (!ownsIntro) {
    throw new Error("You don't have permission to do that!");
  }

  const commentResult = await ctx.db.query.introCommentsConnection(
    {
      where: {
        commentTo_some: { id: args.id }
      }
    },
    '{ aggregate { count }}'
  );
  if (commentResult.aggregate.count > 0) {
    throw new Error("Can't delete intro with comments");
  }

  const days = differenceInDays(new Date(), intro.createdAt);
  if (days >= 1) {
    throw new Error("Can't delete intro older than 1 day");
  }

  // 3. Delete it!

  // await ctx.db.mutation.deleteManyQuestionVotes(
  //   {
  //     where: { votedQuestion: { id: args.id } }
  //   },
  //   null
  // );

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
    data: { points: currentUser.points - 50 }
  });

  return ctx.db.mutation.deleteIntro({ where }, info);
};

const updateIntro = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }
  const intro = await ctx.db.query.intro(
    {
      where: { id: args.id }
    },
    `{ id
      createdAt
      postedBy { id }}`
  );

  const hasPermissions = ctx.request.user.permissions.some(permission =>
    ['ADMIN', 'MODERATOR'].includes(permission)
  );

  if (hasPermissions) {
    const updates = {
      ...args
    };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateIntro(
      {
        data: updates,

        where: {
          id: args.id
        }
      },
      info
    );
  }

  const ownsIntro = intro.postedBy[0].id === ctx.request.userId;

  if (!ownsIntro && !hasPermissions) {
    throw new Error("You don't have permission to do that!");
  }

  const commentResult = await ctx.db.query.introCommentsConnection(
    {
      where: {
        commentTo_some: { id: args.id }
      }
    },
    '{ aggregate { count }}'
  );
  if (commentResult.aggregate.count > 0) {
    throw new Error("Can't edit intro with answers");
  }

  const days = differenceInDays(new Date(), intro.createdAt);
  if (days >= 1) {
    throw new Error("Can't edit intro older than 1 day");
  }

  // first take a copy of the updates
  const updates = {
    ...args
  };
  // remove the ID from the updates
  delete updates.id;
  // run the update method
  return ctx.db.mutation.updateIntro(
    {
      data: updates,

      where: {
        id: args.id
      }
    },
    info
  );
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

const createIntroWelcome = async function(parent, args, ctx, info) {
  let introWelcome;
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }
  const welcomes = await ctx.db.query.introWelcomes({
    where: {
      welcomedBy: { id: ctx.request.userId },
      welcomedIntro: { id: args.id }
    }
  });

  if (welcomes.length === 0) {
    introWelcome = await ctx.db.mutation.createIntroWelcome({
      data: {
        welcome: args.welcome,
        // This is how to create a relationship between the Item and the User
        welcomedBy: {
          connect: {
            id: ctx.request.userId
          }
        },
        welcomedIntro: {
          connect: {
            id: args.id
          }
        }
      }
    });
  } else {
    introWelcome = await ctx.db.mutation.updateIntroWelcome({
      where: {
        id: welcomes[0].id
      },
      data: {
        welcome: args.welcome
      }
    });
  }

  return introWelcome;
};

exports.createIntro = createIntro;
exports.deleteIntro = deleteIntro;
exports.updateIntro = updateIntro;
exports.createIntroWelcome = createIntroWelcome;
exports.createIntroComment = createIntroComment;
exports.updateIntroComment = updateIntroComment;
exports.deleteIntroComment = deleteIntroComment;
