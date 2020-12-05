import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
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
import config from "./config";
const main = async () => {
  await createConnection({
    type: "postgres",
    url: config.databaseUrl,
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
  app.use(
    cors({
      origin: config.corsOriginUrl,
      credentials: true,
    })
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
      userLoader: createUserLoader(),
      communityLoader: createCommunityLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(config.port, () => {
    console.log(`Server running at port ${config.port}`);
  });
};
// Test Comment
main().catch((err) => console.log(err));
