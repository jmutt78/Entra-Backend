const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const _ = require('lodash');
const fetch = require('node-fetch');
const qs = require('qs');
const {
  transport,
  makeANiceEmail,
  welcomeEmail,
  resetEmail
} = require('../mail');
const { hasPermission } = require('../utils');
const { differenceInDays } = require('date-fns');
const crypto = require('crypto');

const Mutations = {
  //--------------------Signup Mutation--------------------//
  async signup(parent, args, ctx, info) {
    // lowercase their email
    args.email = args.email.toLowerCase();

    const sizedFields = {
      password: {
        min: 8,
        max: 72
      }
    };

    const tooSmallField = Object.keys(sizedFields).find(
      field =>
        'min' in sizedFields[field] &&
        args.password.trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
      field =>
        'max' in sizedFields[field] &&
        args.password.trim().length > sizedFields[field].max
    );

    if (tooSmallField) {
      throw new Error(
        `Must be at least ${sizedFields[tooSmallField].min} characters long`
      );
    }
    if (tooLargeField) {
      throw new Error(
        `Must be at most ${sizedFields[tooLargeField].max} characters long`
      );
    }

    if (args.password.search(/[a-z]/) == -1) {
      throw new Error('Your password needs at least one lower case letter. ');
    }

    if (args.password.search(/[A-Z]/) == -1) {
      throw new Error('Your password needs at least one upper case letter. ');
    }

    if (args.password.search(/[0-9]/) == -1) {
      throw new Error('password needs a number.');
    }

    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    );
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    const mailRes = await transport.sendMail({
      from: 'jmcintosh@entra.io',
      to: user.email,
      bcc: 'fa7d6d3352d7d8eaa07e789fd889a4e9@inbound.postmarkapp.com',
      subject: 'Welcome to Entra!',
      html: welcomeEmail(`${args.name}`)
    });

    // Finalllllly we return the user to the browser
    return user;
  },
  async facebookLogin(parent, args, ctx, info) {
    // lowercase their email
    args.email = args.email.toLowerCase();
    let user = await ctx.db.query.user({ where: { email: args.email } });

    // Randomly generated password as it is requried
    const password = await bcrypt.hash(
      crypto.randomBytes(64).toString('hex'),
      10
    );
    if (!user) {
      // create the user in the database

      user = await ctx.db.mutation.createUser(
        {
          data: {
            name: args.name,
            display: args.name,
            email: args.email,
            password,
            permissions: { set: ['USER'] }
          }
        },
        info
      );
      const mailRes = await transport.sendMail({
        from: 'jmcintosh@entra.io',
        to: user.email,
        bcc: 'fa7d6d3352d7d8eaa07e789fd889a4e9@inbound.postmarkapp.com',
        subject: 'Welcome to Entra!',
        html: welcomeEmail(`${args.name}`)
      });
    }
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return user;
  },
  async googleLogin(parent, args, ctx, info) {
    // lowercase their email
    args.email = args.email.toLowerCase();
    let user = await ctx.db.query.user({ where: { email: args.email } });

    // Randomly generated password as it is requried
    const password = await bcrypt.hash(
      crypto.randomBytes(64).toString('hex'),
      10
    );
    if (!user) {
      // create the user in the database
      user = await ctx.db.mutation.createUser(
        {
          data: {
            name: args.name,
            display: args.name,
            email: args.email,
            password,
            permissions: { set: ['USER'] }
          }
        },
        info
      );
      const mailRes = await transport.sendMail({
        from: 'jmcintosh@entra.io',
        to: user.email,
        bcc: 'fa7d6d3352d7d8eaa07e789fd889a4e9@inbound.postmarkapp.com',
        subject: 'Welcome to Entra!',
        html: welcomeEmail(`${args.name}`)
      });
    }
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    // Finalllllly we return the user to the browser
    return user;
  },
  async linkedinLogin(parent, args, ctx, info) {
    const queryString = qs.stringify({
      grant_type: 'authorization_code',
      code: args.code,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET
    });
    let emailResult, profileResult;
    const accessTokenResult = await fetch(
      `https://www.linkedin.com/oauth/v2/accessToken?${queryString}`,
      {
        method: 'POST'
      }
    ).then(response => response.json());
    if (accessTokenResult && accessTokenResult.access_token) {
      emailResult = await fetch(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
        {
          headers: {
            Authorization: `Bearer ${accessTokenResult.access_token}`
          }
        }
      ).then(response => response.json());
      profileResult = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          Authorization: `Bearer ${accessTokenResult.access_token}`
        }
      }).then(response => response.json());
    }
    const email = _.get(emailResult, 'elements.[0].handle~.emailAddress', '');
    const firstName = _.get(profileResult, 'localizedFirstName');
    const lastName = _.get(profileResult, 'localizedLastName');
    const name = `${firstName} ${lastName}`;
    let user = await ctx.db.query.user({
      where: { email: email.toLowerCase() }
    });

    // Randomly generated password as it is requried
    const password = await bcrypt.hash(
      crypto.randomBytes(64).toString('hex'),
      10
    );
    if (!user) {
      const mailRes = await transport.sendMail({
        from: 'jmcintosh@entra.io',
        to: email,
        bcc: 'fa7d6d3352d7d8eaa07e789fd889a4e9@inbound.postmarkapp.com',
        subject: 'Welcome to Entra!',
        html: welcomeEmail(`${name}`)
      });
      // create the user in the database
      user = await ctx.db.mutation.createUser(
        {
          data: {
            name,
            display: firstName,
            email,
            password,
            permissions: { set: ['USER'] }
          }
        },
        info
      );
    }
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    // Finalllllly we return the user to the browser
    return user;
  },
  //--------------------Signin Mutation--------------------//
  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // 3. generate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // 5. Return the user
    return user;
  },
  //--------------------Signout Mutation--------------------//
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
  //--------------------Reset Password--------------------//
  async requestReset(parent, args, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // 2. Set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    const mailRes = await transport.sendMail({
      from: 'jmcintosh@entra.io',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: resetEmail(
        `${user.name}`,
        `You recently requested to reset your password for your Entra account. Use thelink below to reset it. This password reset is only valid for the next 24 hours.
          \n\n
          <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`
      )
    });

    // 4. Return the message
    return { message: 'Thanks!' };
    // 3. Email them that reset token
  },
  //--------------------Reset Password input Mutation--------------------//
  async resetPassword(parent, args, ctx, info) {
    // 1. check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Yo Passwords don't match!");
    }
    // 2. check if its a legit reset token
    // 3. Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }

    const sizedFields = {
      password: {
        min: 8,
        max: 72
      }
    };

    const tooSmallField = Object.keys(sizedFields).find(
      field =>
        'min' in sizedFields[field] &&
        args.password.trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
      field =>
        'max' in sizedFields[field] &&
        args.password.trim().length > sizedFields[field].max
    );

    if (tooSmallField) {
      throw new Error(
        `Must be at least ${sizedFields[tooSmallField].min} characters long`
      );
    }
    if (tooLargeField) {
      throw new Error(
        `Must be at most ${sizedFields[tooLargeField].max} characters long`
      );
    }

    if (args.password.search(/[a-z]/) == -1) {
      throw new Error('Your password needs at least one lower case letter. ');
    }

    if (args.password.search(/[A-Z]/) == -1) {
      throw new Error('Your password needs at least one upper case letter. ');
    }

    if (args.password.search(/[0-9]/) == -1) {
      throw new Error('password needs a number.');
    }
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // 8. return the new user
    return updatedUser;
  },
  //--------------------Update User Profile--------------------//
  updateUser(parent, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateUser(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  //--------------------Questions--------------------//

  async createQuestion(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const question = await ctx.db.mutation.createQuestion(
      {
        data: {
          // This is how to create a relationship between the Item and the User
          askedBy: {
            connect: {
              id: ctx.request.userId
            }
          },

          ...args,
          tags: { connect: args.tags }
        }
      },
      info
    );

    return question;
  },

  async createQuestionView(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    const views = await ctx.db.query.questionViews({
      where: {
        viewedBy: { id: ctx.request.userId },
        viewedQuestion: { id: args.questionId }
      }
    });

    if (views.length === 0) {
      const question = await ctx.db.mutation.createQuestionView({
        data: {
          // This is how to create a relationship between the Item and the User
          viewedBy: {
            connect: {
              id: ctx.request.userId
            }
          },
          viewedQuestion: {
            connect: {
              id: args.questionId
            }
          }
        }
      });
    }

    return true;
  },

  async createQuestionVote(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    const votes = await ctx.db.query.questionVotes({
      where: {
        votedBy: { id: ctx.request.userId },
        votedQuestion: { id: args.questionId }
      }
    });
    if (votes.length === 0) {
      const questionVote = await ctx.db.mutation.createQuestionVote({
        data: {
          vote: args.vote,
          // This is how to create a relationship between the Item and the User
          votedBy: {
            connect: {
              id: ctx.request.userId
            }
          },
          votedQuestion: {
            connect: {
              id: args.questionId
            }
          }
        }
      });
    } else {
      const questionVote = await ctx.db.mutation.updateQuestionVote({
        where: {
          id: votes[0].id
        },
        data: {
          vote: args.vote
        }
      });
    }

    return true;
  },

  async deleteQuestion(parent, args, ctx, info) {
    const where = { id: args.id };

    const question = await ctx.db.query.question(
      {
        where: { id: args.id }
      },
      `{ id
        createdAt
        askedBy { id }}`
    );
    if (!question) {
      throw new Error('Question already deleted');
    }

    const ownsQuestion = question.askedBy[0].id === ctx.request.userId;

    if (!ownsQuestion) {
      throw new Error("You don't have permission to do that!");
    }

    const answersResult = await ctx.db.query.answersConnection(
      {
        where: {
          answeredTo_some: { id: args.id }
        }
      },
      '{ aggregate { count }}'
    );
    if (answersResult.aggregate.count > 0) {
      throw new Error("Can't delete question with answers");
    }

    const days = differenceInDays(new Date(), question.createdAt);
    if (days >= 1) {
      throw new Error("Can't delete question older than 1 day");
    }

    // 3. Delete it!

    await ctx.db.mutation.deleteManyQuestionVotes(
      {
        where: { votedQuestion: { id: args.id } }
      },
      null
    );
    await ctx.db.mutation.deleteManyQuestionViews(
      {
        where: { viewedQuestion: { id: args.id } }
      },
      null
    );
    return ctx.db.mutation.deleteQuestion({ where }, info);
  },

  async updateQuestion(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    const question = await ctx.db.query.question(
      {
        where: { id: args.id }
      },
      `{ id
        createdAt
        tags { name }
        askedBy { id }}`
    );

    const deletedTags = args.tags
      ? _.differenceBy(question.tags, args.tags, tag => tag.name)
      : [];
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'MODERATOR'].includes(permission)
    );

    if (hasPermissions) {
      const updates = {
        ...args,
        tags: { disconnect: deletedTags, connect: args.tags }
      };
      // remove the ID from the updates
      delete updates.id;
      // run the update method
      return ctx.db.mutation.updateQuestion(
        {
          data: updates,

          where: {
            id: args.id
          }
        },
        info
      );
    }

    const ownsQuestion = question.askedBy[0].id === ctx.request.userId;

    if (!ownsQuestion && !hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }

    const answersResult = await ctx.db.query.answersConnection(
      {
        where: {
          answeredTo_some: { id: args.id }
        }
      },
      '{ aggregate { count }}'
    );
    if (answersResult.aggregate.count > 0) {
      throw new Error("Can't edit question with answers");
    }

    const days = differenceInDays(new Date(), question.createdAt);
    if (days >= 1) {
      throw new Error("Can't edit question older than 1 day");
    }

    // first take a copy of the updates
    const updates = {
      ...args,
      tags: { disconnect: deletedTags, connect: args.tags }
    };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateQuestion(
      {
        data: updates,

        where: {
          id: args.id
        }
      },
      info
    );
  },

  //--------------------Answers--------------------//
  async createAnswerVote(parent, args, ctx, info) {
    let answerVote;
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    const votes = await ctx.db.query.answerVotes({
      where: {
        votedBy: { id: ctx.request.userId },
        votedAnswer: { id: args.answerId }
      }
    });
    if (votes.length === 0) {
      answerVote = await ctx.db.mutation.createAnswerVote({
        data: {
          vote: args.vote,
          // This is how to create a relationship between the Item and the User
          votedBy: {
            connect: {
              id: ctx.request.userId
            }
          },
          votedAnswer: {
            connect: {
              id: args.answerId
            }
          }
        }
      });
    } else {
      answerVote = await ctx.db.mutation.updateAnswerVote({
        where: {
          id: votes[0].id
        },
        data: {
          vote: args.vote
        }
      });
    }

    return answerVote;
  },

  createTag: async (parent, args, ctx, info) => {
    const name = args.name.trim().toLowerCase();
    const exists = await ctx.db.query.tag({ where: { name } });

    if (exists) {
      throw new Error('Tag already exists');
    }

    if (name.length < 2) {
      throw new Error('Tag should have alteast 2 characters');
    }

    return ctx.db.mutation.createTag(
      {
        data: {
          name: name
        }
      },
      info
    );
  },

  createAnswer: async (parent, args, ctx, info) => {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const newAnswer = await ctx.db.mutation.createAnswer({
      data: {
        body: args.body,
        approval: args.approval,
        answeredBy: { connect: { id: ctx.request.userId } },
        answeredTo: { connect: { id: args.questionId } }
      }
    });

    return newAnswer;
  },

  async updateAnswer(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const answer = await ctx.db.query.answer(
      {
        where: { id: args.id }
      },
      `{ id body
        selected
        createdAt
        answerVote { id }
        answeredBy { id }}`
    );

    const ownsAnswer = answer.answeredBy.id === ctx.request.userId;

    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'MODERATOR'].includes(permission)
    );

    if (hasPermissions) {
      // first take a copy of the updates
      const updates = { ...args };
      // remove the ID from the updates
      delete updates.id;
      // run the update method
      return ctx.db.mutation.updateAnswer(
        {
          data: updates,
          where: {
            id: args.id
          }
        },
        info
      );
    }

    if (!ownsAnswer && !hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }

    if (answer.selected) {
      throw new Error("Can't edit selected answer");
    }

    const days = differenceInDays(new Date(), answer.createdAt);
    if (days >= 2) {
      throw new Error("Can't edit answers older than 2 days");
    }

    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateAnswer(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async selectAnswer(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    const answer = await ctx.db.query.answer(
      {
        where: {
          id: args.id
        }
      },
      `{ id body answeredBy { id } answeredTo { id askedBy { id }}}`
    );
    if (answer.answeredTo[0].askedBy[0].id !== ctx.request.userId) {
      throw new Error('Answer can be approved only by question author');
    }
    // Clear previously selected answers
    await ctx.db.mutation.updateManyAnswers({
      data: { selected: false },
      where: {
        answeredTo_some: { id: answer.answeredTo[0].id },
        selected: true
      }
    });
    return ctx.db.mutation.updateAnswer(
      {
        data: {
          selected: true
        },
        where: {
          id: args.id
        }
      },
      info
    );
  },

  async deleteAnswer(parent, args, ctx, info) {
    const where = { id: args.id };

    const answer = await ctx.db.query.answer(
      {
        where: { id: args.id }
      },
      `{ id body
        selected
        createdAt
        answerVote { id }
        answeredBy { id }}`
    );

    if (!answer) {
      throw new Error('Answer already deleted');
    }

    const ownsAnswer = answer.answeredBy.id === ctx.request.userId;

    if (!ownsAnswer) {
      throw new Error("You don't have permission to do that!");
    }

    if (answer.selected) {
      throw new Error("Can't delete selected answer");
    }

    const days = differenceInDays(new Date(), answer.createdAt);
    if (days >= 2) {
      throw new Error("Can't delete answers older than 2 days");
    }

    // 3. Delete it!

    await ctx.db.mutation.deleteManyAnswerVotes(
      {
        where: { votedAnswer: { id: args.id } }
      },
      null
    );

    return ctx.db.mutation.deleteAnswer({ where }, info);
  },

  //--------------------Permissions--------------------//
  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );

    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },

  //--------------------Blog--------------------//

  async createBlog(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const newBlog = await ctx.db.mutation.createBlog(
      {
        data: {
          blocks: {
            connect: {
              id: args.key,
              ...args
            }
          }
        }
      },
      info
    );

    return newBlog;
  },

  createBookMark: async (parent, args, ctx, info) => {
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
  },

  async deleteBookMark(parent, args, ctx, info) {
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
  }
};

module.exports = Mutations;
