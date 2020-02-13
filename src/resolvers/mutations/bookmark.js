const createBookMark = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const newBookMark = await ctx.db.mutation.createBookMark({
    data: {
      markedBy: { connect: { id: ctx.request.userId } },
      questions: { connect: { id: args.questionId } }
    }
  });

  return newBookMark;
};

const deleteBookMark = async function(parent, args, ctx, info) {
  const where = { id: args.id };

  const bookmark = await ctx.db.query.bookMark(
    {
      where: { id: args.id }
    },
    `{ id markedBy { id } }`
  );

  const ownsBookMark = bookmark.markedBy.id === ctx.request.userId;

  if (!ownsBookMark) {
    throw new Error("You don't have permission to do that!");
  }

  // 3. Delete it!
  return ctx.db.mutation.deleteBookMark({ where }, info);
};

exports.createBookMark = createBookMark;
exports.deleteBookMark = deleteBookMark;
