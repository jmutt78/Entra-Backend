const Answer = {
  async upVotes(parent, args, ctx, info) {
    const result = await ctx.db.query.answerVotesConnection(
      {
        where: {
          vote: "up",
          votedAnswer: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );

    return result.aggregate.count;
  },
  async downVotes(parent, args, ctx, info) {
    const result = await ctx.db.query.answerVotesConnection(
      {
        where: {
          vote: "down",
          votedAnswer: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count;
  }
};
module.exports = Answer;
