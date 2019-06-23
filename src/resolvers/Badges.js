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
  }
};

module.exports = Badges;
