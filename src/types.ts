import { createCommunityLoader } from "./utils/createCommunityLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  req: Request;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  communityLoader: ReturnType<typeof createCommunityLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
