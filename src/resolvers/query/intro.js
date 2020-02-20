const intro = async (parent, args, ctx, info) => {
  const introPost = await ctx.db.query.intro(
    {
      where: { id: args.id }
    },
    info
  );

  return introPost;
};

exports.intro = intro;
