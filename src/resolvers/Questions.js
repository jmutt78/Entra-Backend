const Questions = {
  id: parent => parent.id,
  title: parent => parent.title,
  description: parent => parent.description,
  tags: async (parent, args, ctx) => {
    const tags = await ctx.db.question({ id: parent.id }).tags();
    return tags;
  },
  createdAt: parent => parent.createdAt,
  updatedAt: parent => parent.updatedAt
};
export default Questions;
