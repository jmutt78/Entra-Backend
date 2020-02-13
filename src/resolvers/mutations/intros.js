const createIntro = async function(parent, args, ctx, info) {
  if (!ctx.request.userId) {
    throw new Error('You must be logged in to do that!');
  }

  const intro = await ctx.db.mutation.createIntro(
    {
      data: {
        // This is how to create a relationship between the Item and the User
        postedBy: {
          connect: {
            id: ctx.request.userId
          }
        },

        ...args
      }
    },
    info
  );

  const currentUser = await ctx.db.query.user(
    {
      where: {
        id: ctx.request.userId
      }
    },
    `{ id
            points
        }`
  );

  const res = await ctx.db.mutation.updateUser({
    where: { id: currentUser.id },
    data: { points: currentUser.points + 50 }
  });

  const mailRes = await transport.sendMail({
    from: 'jmcintosh@entra.io',
    to: 'jmcintosh@entra.io',
    subject: 'New Intro!',
    html: makeANiceEmail(`${ctx.request.userId}`, `${args.title}`)
  });

  return intro;
};

exports.createIntro = createIntro;
