require("dotenv").config({ path: ".env" });

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { importSchema } = require("graphql-import");
const resolvers = require("./resolvers");
const db = require("./db");

const PORT = process.env.PORT || 8000;

const server = new ApolloServer({
  typeDefs: importSchema("src/schema.graphql"),
  resolvers: resolvers,
  context: ({ req, res }) => ({ request: req, response: res, db }),
  playground: {
    settings: {
      "request.credentials": "include"
    }
  }
});

const app = express();
app.use(cookieParser());
app.use((req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

app.use(async (req, res, next) => {
  // if they aren't logged in, skip this
  if (!req.userId) return next();
  const user = await db.query.user(
    { where: { id: req.userId } },
    "{ id, permissions, email, name, display }"
  );
  req.user = user;
  next();
});

server.applyMiddleware({
  app,
  path: "/",
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
});

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:${PORT}`)
);
