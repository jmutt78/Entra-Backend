const { hasPermission } = require('../../utils.js');

const me = async (parent, args, ctx, info) => {
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
};

const user = async (parent, args, ctx, info) => {
  return ctx.db.query.user(
    {
      where: { id: args.id }
    },
    info
  );
};

const users = async (parent, args, ctx, info) => {
  const { userId } = ctx.request;
  if (!userId) {
    throw new Error('you must be signed in!');
  }

  if (args.filter === 'leaderboard') {
    let leaderUsers = await ctx.db.query.users(
      {
        where: {
          points_gte: 500
        }
      },
      info
    );

    return leaderUsers;
  }
  hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
  if (hasPermission) {
    return ctx.db.query.users({}, info);
  }
};

const bookMark = async (parent, args, ctx, info) => {
  const bookmarked = await ctx.db.query.bookMark(
    {
      where: { id: args.id }
    },
    info
  );

  return bookmarked;
};

exports.me = me;
exports.user = user;
exports.users = users;
exports.bookMark = bookMark;
