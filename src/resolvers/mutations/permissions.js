const { hasPermission } = require('../../utils.js');

const updatePermissions = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const currentUser = await ctx.db.query.user(
    {
      where: {
        id: ctx.request.userId
      }
    },
    info
  );

  hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

  return ctx.db.mutation.updateUser(
    {
      data: {
        permissions: {
          set: args.permissions
        }
      },
      where: {
        id: args.userId
      }
    },
    info
  );
};

exports.updatePermissions = updatePermissions;
