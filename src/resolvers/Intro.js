const Intro = {
  async welcomeCount(parent, args, ctx, info) {
    const result = await ctx.db.query.introWelcomesConnection(
      {
        where: {
          welcome: 'up',
          welcomedIntro: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );

    return result.aggregate.count;
  }
};
module.exports = Intro;
