var _ = require("lodash");

const Badges = {
  async autobiographer(parent, args, ctx, info) {
    const [user] = await ctx.db.query.users({
      where: {
        id: parent.id
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
          votedBy: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count >= 1;
  },
  async patron(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          vote: "up",
          votedBy: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count >= 1;
  },
  async reviewer(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          votedBy: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count >= 10;
  },
  async analyst(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          votedBy: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count >= 20;
  },
  async commentor(parent, args, ctx, info) {
    const result = await ctx.db.query.answersConnection(
      {
        where: {
          answeredBy: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count >= 10;
  },
  async frequentFlyer(parent, args, ctx, info) {
    const result = await ctx.db.query.answersConnection(
      {
        where: {
          answeredBy: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count >= 20;
  },
  async niceAnswer(parent, args, ctx, info) {
    const answers = await ctx.db.query.answers(
      {
        where: {
          answeredBy: { id: parent.id }
        }
      },
      "{ id }"
    );
    let hasNiceAnswer = false;
    for (const answer of answers) {
      const result = await ctx.db.query.answerVotesConnection(
        {
          where: {
            votedAnswer: { id: answer.id }
          }
        },
        "{ aggregate { count }}"
      );
      if (result.aggregate.count >= 1) {
        hasNiceAnswer = true;
        break;
      }
    }
    return hasNiceAnswer;
  }
};

module.exports = Badges;
