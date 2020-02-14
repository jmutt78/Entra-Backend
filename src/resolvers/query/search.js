const _ = require('lodash');

const getCaseSensitiveResults = async (condition, ctx, info) => {
  let { queryLower, queryUpper, queryUpperFirst } = {};
  let querySource = '';
  if (condition.title_contains) {
    querySource = 'Question';
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
    querySource = 'Question';
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

  if (condition.answers_some && condition.answers_some.AND[0].body_contains) {
    querySource = 'Answer';
    queryLower = {
      AND: [
        {
          answers_some: {
            AND: [
              {
                body_contains: _.toLower(
                  condition.answers_some.AND[0].body_contains
                )
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
                body_contains: _.toUpper(
                  condition.answers_some.AND[0].body_contains
                )
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
                body_contains: _.upperFirst(
                  condition.answers_some.AND[0].body_contains
                )
              },
              { approval: true }
            ]
          }
        },
        { approval: true }
      ]
    };
  }

  if (condition.tags_some) {
    querySource = 'Tag';
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
    querySource = 'asked';
    queryLower = {
      AND: [
        {
          askedBy_some: {
            display_contains: _.toLower(condition.askedBy_some.display_contains)
          }
        },
        { approval: true }
      ]
    };
    queryUpper = {
      AND: [
        {
          askedBy_some: {
            display_contains: _.toUpper(condition.askedBy_some.display_contains)
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

  if (condition.answers_some && condition.answers_some.AND[0].answeredBy) {
    querySource = 'answered to';
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
  // Eliminate duplicates between upper lower and firstUpper results
  let result = toLowerResult.concat(toUpperResult).concat(upperFirstResult);
  result = result
    .filter((q, i, array) => i === array.findIndex(t => t.id === q.id))
    .map(q => {
      return {
        ...q,
        searchTermFoundIn: getPrefix(q, querySource)
      };
    });
  return result;
};

const getPrefix = ({ title, askedBy, answers }, querySource) => {
  switch (querySource) {
    case 'Question':
      return `${querySource}`;

    case 'Answer':
      return `${querySource}`;

    case 'Tag':
      return `${querySource}`;

    case 'asked':
      return `${askedBy[0].display} asked`;

    case 'answered to':
      return `${answers[0].answeredBy.display} answered to`;

    default:
      return title;
  }
};

const searchQuestions = async (parent, args, ctx, info) => {
  const { limit, offset = 0, noDuplicates = false } = args;
  const conditions = args.where.AND;
  const titleResults = await getCaseSensitiveResults(conditions[0], ctx, info);
  const descriptionResults = await getCaseSensitiveResults(
    conditions[1],
    ctx,
    info
  );
  let questions = titleResults.concat(descriptionResults);
  questions = questions.filter(
    (q, i, array) => i === array.findIndex(t => t.id === q.id)
  );
  const answerResults = await getCaseSensitiveResults(conditions[2], ctx, info);
  const tagResults = await getCaseSensitiveResults(conditions[3], ctx, info);
  const userAskResults = await getCaseSensitiveResults(
    conditions[4],
    ctx,
    info
  );
  const userAnswerResults = await getCaseSensitiveResults(
    conditions[5],
    ctx,
    info
  );

  let result = questions
    .concat(answerResults)
    .concat(tagResults)
    .concat(userAskResults)
    .concat(userAnswerResults);

  if (noDuplicates) {
    result = _.uniqBy(result, 'id');
  }
  return result.filter((q, i) => i >= offset && i < offset + limit);
};

exports.searchQuestions = searchQuestions;
