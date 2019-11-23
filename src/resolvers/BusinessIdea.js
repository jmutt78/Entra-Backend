const BusinessIdea = {
  async upVotes(parent, args, ctx, info) {
    const result = await ctx.db.query.businessIdeaVotesConnection(
      {
        where: {
          vote: 'up',
          votedBusinessIdea: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );

    return result.aggregate.count;
  },
  async downVotes(parent, args, ctx, info) {
    const result = await ctx.db.query.businessIdeaVotesConnection(
      {
        where: {
          vote: 'down',
          votedBusinessIdea: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );
    return result.aggregate.count;
  }
};
module.exports = BusinessIdea;
