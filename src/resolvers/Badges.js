var _ = require('lodash');

const Badges = {
  async autobiographer(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const [user] = await ctx.db.query.users({
      where: {
        id: parent.id
      }
    });
    const profile = _.pick(user, [
      'name',
      'email',
      'display',
      'location',
      'image',
      'about',
      'industry'
    ]);
    const profileValues = _.values(profile);
    const isAutobiographer = _.every(profileValues, value => Boolean(value));
    return isAutobiographer;
  },
  async critic(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          vote: 'down',
          votedBy: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );
    return result.aggregate.count >= 1;
  },
  async patron(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          vote: 'up',
          votedBy: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );
    return result.aggregate.count >= 1;
  },
  async reviewer(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          votedBy: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );
    return result.aggregate.count >= 10;
  },
  async analyst(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const result = await ctx.db.query.questionVotesConnection(
      {
        where: {
          votedBy: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );
    return result.aggregate.count >= 20;
  },
  async commentor(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const result = await ctx.db.query.answersConnection(
      {
        where: {
          answeredBy: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );
    return result.aggregate.count >= 10;
  },
  async frequentFlyer(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const result = await ctx.db.query.answersConnection(
      {
        where: {
          answeredBy: { id: parent.id }
        }
      },
      '{ aggregate { count }}'
    );
    return result.aggregate.count >= 20;
  },
  async niceAnswer(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const answers = await ctx.db.query.answers(
      {
        where: {
          answeredBy: { id: parent.id }
        }
      },
      '{ id }'
    );
    let hasNiceAnswer = false;
    for (const answer of answers) {
      const result = await ctx.db.query.answerVotesConnection(
        {
          where: {
            votedAnswer: { id: answer.id }
          }
        },
        '{ aggregate { count }}'
      );
      if (result.aggregate.count >= 10) {
        hasNiceAnswer = true;
        break;
      }
    }
    return hasNiceAnswer;
  },
  async expert(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const answers = await ctx.db.query.answers(
      {
        where: {
          answeredBy: { id: parent.id }
        }
      },
      '{ id }'
    );
    let isExpert = false;
    for (const answer of answers) {
      const result = await ctx.db.query.answerVotesConnection(
        {
          where: {
            votedAnswer: { id: answer.id }
          }
        },
        '{ aggregate { count }}'
      );
      if (result.aggregate.count >= 25) {
        isExpert = true;
        break;
      }
    }
    return isExpert;
  },
  async teacher(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const tags = await ctx.db.query.tags(null, '{ name }');
    let isTeacher = false;
    for (const tag of tags) {
      const result = await ctx.db.query.answersConnection(
        {
          where: {
            answeredBy: { id: parent.id },
            selected: true,
            answeredTo_some: { tags_some: { name: tag.name } }
          }
        },
        '{ aggregate { count }}'
      );
      if (result.aggregate.count >= 7) {
        isTeacher = true;
        break;
      }
    }
    return isTeacher;
  },
  async pundit(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const tags = await ctx.db.query.tags(null, '{ name }');
    let isPundit = false;
    for (const tag of tags) {
      const result = await ctx.db.query.answersConnection(
        {
          where: {
            answeredBy: { id: parent.id },
            selected: true,
            answeredTo_some: { tags_some: { name: tag.name } }
          }
        },
        '{ aggregate { count }}'
      );
      if (result.aggregate.count >= 10) {
        isPundit = true;
        break;
      }
    }
    return isPundit;
  },
  async powerVoter(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const questions = await ctx.db.query.questions(
      {
        askedBy: { id: parent.id }
      },
      '{ id }'
    );
    let isPoverVoter = false;
    for (const question of questions) {
      const result = await ctx.db.query.questionVotesConnection(
        {
          where: {
            votedQuestion: { id: question.id }
          }
        },
        '{ aggregate { count }}'
      );
      if (result.aggregate.count >= 15) {
        isPoverVoter = true;
        break;
      }
    }
    return isPoverVoter;
  },
  async provoker(parent, args, ctx, info) {
    info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PRIVATE' });
    const questions = await ctx.db.query.questions(
      {
        askedBy: { id: parent.id }
      },
      '{ id }'
    );
    let isProvoker = false;
    for (const question of questions) {
      const answers = await ctx.db.query.answers(
        {
          where: {
            answeredTo_some: { id: question.id }
          }
        },
        '{ answeredBy {id}}'
      );
      const answersByDifferentUsers = _.uniqBy(answers, a => a.answeredBy.id);
      if (answersByDifferentUsers.length >= 5) {
        isProvoker = true;
        break;
      }
    }
    return isProvoker;
  }
};

module.exports = Badges;
