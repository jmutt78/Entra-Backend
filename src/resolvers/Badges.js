var _ = require("lodash");

const Badges = {
  async autobiographer(parent, args, ctx, info) {
    const [user] = await ctx.db.query.users({
      where: {
        id: ctx.request.userId
      }
    });
    const profile = _.pick(user, [
      "name",
      "email",
      "display",
      "location",
      "image",
      "about",
      "industry"
    ]);
    const profileValues = _.values(profile);
    const isAutobiographer = _.every(profileValues, value => Boolean(value));
    return isAutobiographer;
  },
  async critic(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          vote: "down",
          votedBy: { id: ctx.request.userId }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count > 0;
  },
  async patron(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          vote: "up",
          votedBy: { id: ctx.request.userId }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count > 0;
  },
  async reviewer(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          votedBy: { id: ctx.request.userId }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count > 10;
  },
  async analyst(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          votedBy: { id: ctx.request.userId }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count > 20;
  },
  async commentor(parent, args, ctx, info) {
    const result = await ctx.db.query.answersConnection(
      {
        where: {
          answeredBy: { id: ctx.request.userId }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count > 10;
  }
};

module.exports = Badges;