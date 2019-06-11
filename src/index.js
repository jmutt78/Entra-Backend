require("dotenv").config({ path: ".env" });

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { importSchema } = require("graphql-import");
const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const db = require("./db");

const PORT = process.env.PORT || 8000;

const server = new ApolloServer({
  typeDefs: importSchema("src/schema.graphql"),
  resolvers: {
    Mutation,
    Query,
    Node: {
      __resolveType() {
        return null;
      }
    }
  },
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
