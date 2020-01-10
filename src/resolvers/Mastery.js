const Mastery = {
  async level1(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const user = await ctx.db.query.users(
      {
        where: {
          id: parent.id
        }
      },
      `{ id
      points
  }`
    );

    const islevelOne = user[0].points >= 500;

    return islevelOne;
  },
  async level2(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const user = await ctx.db.query.users(
      {
        where: {
          id: parent.id
        }
      },
      `{ id
      points
  }`
    );

    const islevelTwo = user[0].points >= 1000;

    return islevelTwo;
  },
  async level3(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const user = await ctx.db.query.users(
      {
        where: {
          id: parent.id
        }
      },
      `{ id
      points
  }`
    );

    const islevelThree = user[0].points >= 1500;

    return islevelThree;
  },
  async level4(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const user = await ctx.db.query.users(
      {
        where: {
          id: parent.id
        }
      },
      `{ id
      points
  }`
    );

    const islevelFour = user[0].points >= 2000;

    return islevelFour;
  }
};

module.exports = Mastery;
