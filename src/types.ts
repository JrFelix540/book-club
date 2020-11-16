import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createCommunityLoader } from "./utils/createCommunityLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  req: Request & { session: Express.Session };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  communityLoader: ReturnType<typeof createCommunityLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
