import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import constants from "./constants";
import { createConnection } from "typeorm";
import path from "path";
import {
  Post,
  User,
  Author,
  Book,
  Community,
  Genre,
  Review,
  Shelf,
  Upvote,
  UserComment,
  CommentUpvote,
} from "./entities";
import {
  UserResolver,
  PostResolver,
  UserCommentResolver,
  CommunityResolver,
} from "./resolvers";
import { createUserLoader } from "./utils/createUserLoader";
import { createCommunityLoader } from "./utils/createCommunityLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "bookclub",
    username: "saleor",
    password: "saleor",
    logging: true,
    synchronize: true,
    entities: [
      Author,
      Book,
      Community,
      Genre,
      Review,
      Shelf,
      Upvote,
      UserComment,
      User,
      Post,
      CommentUpvote,
    ],
    migrations: [path.join(__dirname, "./migration/*")],
    migrationsTableName: "bookclub_migration_table",
    cli: {
      migrationsDir: "migration",
    },
  });

  const app = express();

  const redis = new Redis();
  const RedisStore = connectRedis(session);

  app.use(
    session({
      name: constants.USERID_COOKIE,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "lax",
        secure: false,
      },
      saveUninitialized: false,
      secret: "route540",
      resave: false,
    }),
  );

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        CommunityResolver,
        PostResolver,
        UserCommentResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      communityLoader: createCommunityLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4040, () => {
    console.log(`Server running at port 4040`);
  });
};

main().catch((err) => console.log(err));
