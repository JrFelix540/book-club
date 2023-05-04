import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import config from "./config";
import { AppDataSource } from "./database/database";
import {
  CommunityResolver,
  PostResolver,
  UserCommentResolver,
  UserResolver,
} from "./resolvers";
import { createCommunityLoader } from "./utils/createCommunityLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
  await AppDataSource.initialize();

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

  app.listen(config.port || 4000, () => {
    console.log(`Server running at port ${config.port || 4000}`);
  });
};
// Test Comment
main().catch((err) => console.log(err));
