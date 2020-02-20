const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const _ = require('lodash');
const fetch = require('node-fetch');
const qs = require('qs');
const crypto = require('crypto');
const env = process.env.NODE_ENV || 'development';
const domain = env === 'production' ? 'entra.io' : undefined;

const {
  createIntro,
  createIntroComment,
  updateIntroComment,
  deleteIntroComment
} = require('./mutations/intros');
const { createBookMark, deleteBookMark } = require('./mutations/bookmark');
const {
  createAnswerVote,
  createTag,
  createAnswer,
  deleteAnswer,
  updateAnswer
} = require('./mutations/answers');
const {
  createBusinessIdea,
  deleteBusinessIdea,
  updateBusinessIdea,
  createBusinessIdeaVote
} = require('./mutations/business-idea');
const {
  createQuestion,
  createQuestionView,
  createQuestionVote,
  deleteQuestion,
  updateQuestion,
  createBounty
} = require('./mutations/questions');
const { updatePermissions } = require('./mutations/permissions');
const { transport, welcomeEmail, resetEmail } = require('../mail');

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
          permissions: { set: ['USER'] },
          points: 50
        }
      },
      info
    );
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      domain: domain,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    const mailRes = await transport.sendMail({
      from: 'jmcintosh@entra.io',
      to: user.email,
      bcc: [
        'fa7d6d3352d7d8eaa07e789fd889a4e9@inbound.postmarkapp.com',
        'jmcintosh@entra.io',
        'us4-7dfe95f860-4ffbd78e14@inbound.mailchimp.com'
      ],
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
        bcc: [
          'fa7d6d3352d7d8eaa07e789fd889a4e9@inbound.postmarkapp.com',
          'jmcintosh@entra.io'
        ],
        subject: 'Welcome to Entra!',
        html: welcomeEmail(`${args.name}`)
      });
    }
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      domain: domain,
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
        bcc: [
          'fa7d6d3352d7d8eaa07e789fd889a4e9@inbound.postmarkapp.com',
          'jmcintosh@entra.io'
        ],
        subject: 'Welcome to Entra!',
        html: welcomeEmail(`${args.name}`)
      });
    }
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      domain: domain,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

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
        bcc: [
          'fa7d6d3352d7d8eaa07e789fd889a4e9@inbound.postmarkapp.com',
          'jmcintosh@entra.io'
        ],
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
      domain: domain,
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
      domain: domain,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // 5. Return the user
    return user;
  },
  //--------------------Signout Mutation--------------------//
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token', { domain: domain });
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
      domain: domain,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // 8. return the new user
    return updatedUser;
  },
  //--------------------Update User Profile--------------------//
  async updateUser(parent, args, ctx, info) {
    const user = await ctx.db.query.user(
      {
        where: { id: args.id }
      },
      `{ id
        tags { name }
    }`
    );

    const deletedTags = args.tags
      ? _.differenceBy(user.tags, args.tags, tag => tag.name)
      : [];

    // first take a copy of the updates
    const updates = {
      ...args,
      tags: { disconnect: deletedTags, connect: args.tags }
    };
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
  createQuestion,
  createQuestionView,
  createQuestionVote,
  deleteQuestion,
  updateQuestion,
  createBounty,

  //--------------------Answers--------------------//
  createAnswer,
  createTag,
  createAnswerVote,
  updateAnswer,
  deleteAnswer,
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
      `{ id body answeredBy { id, points } answeredTo { id, bountyPoints, askedBy { id, points }}}`
    );

    const bountyPoints = answer.answeredTo[0].bountyPoints;
    const questionId = answer.answeredTo[0].id;
    const selectedUserPoints = answer.answeredBy.points;
    const selectedUserId = answer.answeredBy.id;
    const questionUser = answer.answeredTo[0].askedBy[0];

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

    const res = await ctx.db.mutation.updateUser({
      where: { id: questionUser.id },
      data: { points: questionUser.points + 5 }
    });

    if (bountyPoints !== null) {
      const resSelected = await ctx.db.mutation.updateUser({
        where: { id: selectedUserId },
        data: { points: selectedUserPoints + 30 + bountyPoints }
      });

      const resQuestion = await ctx.db.mutation.updateQuestion({
        where: { id: questionId },
        data: { bountyPoints: null }
      });
    } else {
      const resSelected = await ctx.db.mutation.updateUser({
        where: { id: selectedUserId },
        data: { points: selectedUserPoints + 30 }
      });
    }

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

  //--------------------Permissions--------------------//
  updatePermissions,

  //-----------------------BusinessIdea-----------------------//
  createBusinessIdea,
  deleteBusinessIdea,
  updateBusinessIdea,
  createBusinessIdeaVote,

  //--------------------BookMark--------------------//
  createBookMark,
  deleteBookMark,

  //--------------------Intros--------------------//
  createIntro,
  createIntroComment,
  updateIntroComment,
  deleteIntroComment
};

module.exports = Mutations;
