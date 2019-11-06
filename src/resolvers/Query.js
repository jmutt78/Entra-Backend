const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');
const _ = require('lodash');

const Query = {
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  user(parent, args, ctx, info) {
    return ctx.db.query.user(
      {
        where: { id: args.id }
      },
      info
    );
  },
  async users(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('you must be signed in!');
    }

    // 2. Check if the user has the permissions to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

    // 2. if they do, query all the users!
    return ctx.db.query.users({}, info);
  },
  async searchQuestions(parent, args, ctx, info) {
    let { queryLower, queryUpper, queryUpperFirst } = {};
    const condition = args.where.AND[0];

    if (condition.title_contains) {
      queryLower = {
        AND: [
          { title_contains: _.toLower(condition.title_contains) },
          { approval: true }
        ]
      };
      queryUpper = {
        AND: [
          { title_contains: _.toUpper(condition.title_contains) },
          { approval: true }
        ]
      };
      queryUpperFirst = {
        AND: [
          { title_contains: _.upperFirst(condition.title_contains) },
          { approval: true }
        ]
      };
    }

    if (condition.description_contains) {
      queryLower = {
        AND: [
          { description_contains: _.toLower(condition.description_contains) },
          { approval: true }
        ]
      };
      queryUpper = {
        AND: [
          { description_contains: _.toUpper(condition.description_contains) },
          { approval: true }
        ]
      };
      queryUpperFirst = {
        AND: [
          {
            description_contains: _.upperFirst(condition.description_contains)
          },
          { approval: true }
        ]
      };
    }

    if (condition.answers_some && condition.answers_some.body_contains) {
      queryLower = {
        AND: [
          {
            answers_some: {
              body_contains: _.toLower(condition.answers_some.body_contains)
            }
          },
          { approval: true }
        ]
      };
      queryUpper = {
        AND: [
          {
            answers_some: {
              body_contains: _.toUpper(condition.answers_some.body_contains)
            }
          },
          { approval: true }
        ]
      };
      queryUpperFirst = {
        AND: [
          {
            answers_some: {
              body_contains: _.upperFirst(condition.answers_some.body_contains)
            }
          },
          { approval: true }
        ]
      };
    }

    if (condition.tags_some) {
      queryLower = {
        AND: [
          {
            tags_some: {
              name_contains: _.toLower(condition.tags_some.name_contains)
            }
          },
          { approval: true }
        ]
      };
      queryUpper = {
        AND: [
          {
            tags_some: {
              name_contains: _.toUpper(condition.tags_some.name_contains)
            }
          },
          { approval: true }
        ]
      };
      queryUpperFirst = {
        AND: [
          {
            tags_some: {
              name_contains: _.upperFirst(condition.tags_some.name_contains)
            }
          },
          { approval: true }
        ]
      };
    }

    if (condition.askedBy_some) {
      queryLower = {
        AND: [
          {
            askedBy_some: {
              display_contains: _.toLower(
                condition.askedBy_some.display_contains
              )
            }
          },
          { approval: true }
        ]
      };
      queryUpper = {
        AND: [
          {
            askedBy_some: {
              display_contains: _.toUpper(
                condition.askedBy_some.display_contains
              )
            }
          },
          { approval: true }
        ]
      };
      queryUpperFirst = {
        AND: [
          {
            askedBy_some: {
              display_contains: _.upperFirst(
                condition.askedBy_some.display_contains
              )
            }
          },
          { approval: true }
        ]
      };
    }

    if (condition.answers_some && condition.answers_some.AND) {
      queryLower = {
        AND: [
          {
            answers_some: {
              AND: [
                {
                  answeredBy: {
                    display_contains: _.toLower(
                      condition.answers_some.AND[0].answeredBy.display_contains
                    )
                  }
                },
                { approval: true }
              ]
            }
          },
          { approval: true }
        ]
      };
      queryUpper = {
        AND: [
          {
            answers_some: {
              AND: [
                {
                  answeredBy: {
                    display_contains: _.toUpper(
                      condition.answers_some.AND[0].answeredBy.display_contains
                    )
                  }
                },
                { approval: true }
              ]
            }
          },
          { approval: true }
        ]
      };
      queryUpperFirst = {
        AND: [
          {
            answers_some: {
              AND: [
                {
                  answeredBy: {
                    display_contains: _.upperFirst(
                      condition.answers_some.AND[0].answeredBy.display_contains
                    )
                  }
                },
                { approval: true }
              ]
            }
          },
          { approval: true }
        ]
      };
    }

    const toLowerResult = await ctx.db.query.questions(
      {
        where: queryLower
      },
      info
    );
    const toUpperResult = await ctx.db.query.questions(
      {
        where: queryUpper
      },
      info
    );
    const upperFirstResult = await ctx.db.query.questions(
      {
        where: queryUpperFirst
      },
      info
    );

    let result = toLowerResult.concat(toUpperResult).concat(upperFirstResult);
    result = result.filter(
      (q, i, array) => i === array.findIndex(t => t.id === q.id)
    );

    // const result = await ctx.db.query.questions({
    //   where: args.where
    // }, info);

    return result;
  },
  async questions(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (args.filter === 'My BookMarked') {
      return ctx.db.query.questions(
        {
          where: {
            bookMark_some: { markedBy: { id: userId } }
          }
        },
        info
      );
    }

    if (args.filter === 'my') {
      if (!userId) {
        throw new Error('you must be signed in!');
      }
      return ctx.db.query.questions(
        {
          where: {
            askedBy_some: { id: userId }
          }
        },
        info
      );
    }
    if (args.filter === 'all') {
      return ctx.db.query.questions(
        {
          where: {
            approval: true
          }
        },
        info
      );
    }

    if (args.filter === 'tags') {
      return ctx.db.query.questions(
        {
          where: {
            tags_some: { id: args.where.tags_some.id },
            approval: null || true
          }
        },
        info
      );
    }

    if (args.filter === 'user') {
      return ctx.db.query.questions(
        {
          where: {
            askedBy_some: { id: args.where.askedBy_some.id },
            approval: null || true
          }
        },
        info
      );
    }

    if (args.filter === 'approval') {
      return ctx.db.query.questions(
        {
          where: {
            approval: null || false
          }
        },
        info
      );
    }
  },

  async answers(parent, args, ctx, info) {
    const { userId } = ctx.request;

    if (args.filter === 'selected') {
      return ctx.db.query.answers(
        {
          where: {
            selected: true,
            answeredBy: { id: args.where.answeredBy.id },
            approval: null || true
          }
        },
        info
      );
    }

    if (args.filter === 'approval') {
      return ctx.db.query.answers(
        {
          where: {
            approval: null || false
          }
        },
        info
      );
    }

    if (args.filter === 'user') {
      return ctx.db.query.answers(
        {
          where: {
            answeredBy: { id: args.where.answeredBy.id },
            approval: null || true
          }
        },
        info
      );
    }

    if (args.filter === 'my') {
      return ctx.db.query.answers(
        {
          where: {
            answeredBy: { id: userId }
          }
        },
        info
      );
    }

    return null;
  },

  tags: forwardTo('db'),
  async tag(parent, args, ctx, info) {
    const tag = await ctx.db.query.tag(
      {
        where: { id: args.id }
      },
      info
    );

    return tag;
  },
  async questionsConnection(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (args.filter === 'My BookMarked') {
      if (!userId) {
        throw new Error('you must be signed in!');
      }
      return ctx.db.query.questionsConnection(
        {
          where: {
            bookMark_some: { markedBy: { id: userId } }
          }
        },
        info
      );
    }

    if (args.filter === 'my') {
      if (!userId) {
        throw new Error('you must be signed in!');
      }
      return ctx.db.query.questionsConnection(
        {
          where: {
            askedBy_some: { id: userId }
          }
        },
        info
      );
    }
    if (args.filter === 'all') {
      return ctx.db.query.questionsConnection(
        {
          where: {
            approval: true
          }
        },
        info
      );
    }

    if (args.filter === 'tags') {
      return ctx.db.query.questionsConnection(
        {
          where: { tags_some: { id: args.where.tags_some.id } }
        },
        info
      );
    }

    if (args.filter === 'user') {
      return ctx.db.query.questionsConnection(
        {
          where: { askedBy_some: { id: args.where.askedBy_some.id } }
        },
        info
      );
    }

    if (args.filter === 'approval') {
      return ctx.db.query.questionsConnection(
        {
          where: {
            approval: null || false
          }
        },
        info
      );
    }
    return null;
  },
  async answersConnection(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (args.filter === 'selected') {
      return ctx.db.query.answersConnection(
        {
          where: {
            selected: true,
            answeredBy: { id: args.where.answeredBy.id }
          }
        },
        info
      );
    }

    if (args.filter === 'approval') {
      return ctx.db.query.answersConnection(
        {
          where: {
            approval: null || false
          }
        },
        info
      );
    }

    if (args.filter === 'user') {
      return ctx.db.query.answersConnection(
        {
          where: { answeredBy: { id: args.where.answeredBy.id } }
        },
        info
      );
    }

    if (args.filter === 'my') {
      return ctx.db.query.answersConnection(
        {
          where: {
            answeredBy: { id: userId }
          }
        },
        info
      );
    }

    return null;
  },

  async answer(parent, args, ctx, info) {
    const answer = await ctx.db.query.answer(
      {
        where: { id: args.id }
      },
      info
    );

    return answer;
  },
  async bookMark(parent, args, ctx, info) {
    const bookmark = await ctx.db.query.bookMark(
      {
        where: { id: args.id }
      },
      info
    );

    return bookmark;
  },

  answerVote: forwardTo('db'),

  async question(parent, args, ctx, info) {
    const question = await ctx.db.query.question(
      {
        where: { id: args.id }
      },
      info
    );

    return question;
  }
};

module.exports = Query;
