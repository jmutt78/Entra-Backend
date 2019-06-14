const Question = {
  async upVotes(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          vote: "up",
          votedQuestion: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count;
  },
  async downVotes(parent, args, ctx, info) {
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          vote: "down",
          votedQuestion: { id: parent.id }
        }
      },
      "{ aggregate { count }}"
    );
    return result.aggregate.count;
  }
};
module.exports = Question;
