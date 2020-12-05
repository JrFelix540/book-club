import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import jwt from "jsonwebtoken";
import { FieldError, UserDecoded } from "./user";
import { Upvote, User, Community, Post } from "../entities";
import { getConnection, Repository } from "typeorm";
import constants from "../constants";

const allRelations = ["community", "comments", "upvotes"];

@ObjectType()
export class PostResponse {
  @Field(() => Post, { nullable: true })
  post?: Post;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class UpvoteResponse {
  @Field(() => Upvote, { nullable: true })
  upvote?: Upvote;
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post], { nullable: true })
  posts: Post[];

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@Resolver(Post)
export default class PostResolver {
  @FieldResolver(() => String)
  @FieldResolver(() => Boolean)
  isOwner(@Root() post: Post, @Ctx() { req }: MyContext) {
    let userId;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(`Bearer `)[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return false;
        }
        const user: any = decodedToken;
        userId = user.userId;
        return;
      });
    }

    if (userId === post.creatorId) {
      return true;
    } else {
      return false;
    }
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Community)
  community(
    @Root() post: Post,
    @Ctx() { communityLoader }: MyContext,
  ) {
    return communityLoader.load(post.communityId);
  }

  @FieldResolver(() => Boolean)
  async joinStatus(
    @Root() post: Post,
    @Ctx() { communityLoader, req }: MyContext,
  ) {
    let userId: number;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(`Bearer `)[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return false;
        }
        const user: any = decodedToken;
        userId = user.userId;
        return;
      });
    }

    const community = await communityLoader.load(post.communityId);

    const found = community.memberIds.find(
      (commId: number) => commId === userId,
    );

    if (found) {
      return true;
    } else {
      return false;
    }
  }

  @FieldResolver(() => Int, { nullable: true })
  async hasVoted(
    @Root() post: Post,
    @Ctx() { req, upvoteLoader }: MyContext,
  ) {
    let userId;
    if (req.headers.authorization) {
      let user: any;
      const token = req.headers.authorization.split("Bearer ")[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return null;
        }
        user = decodedToken;
        userId = user.userId;
        return;
      });
    }

    if (!userId) {
      return null;
    }
    const upvote = await upvoteLoader.load({
      postId: post.id,
      creatorId: userId,
    });
    return upvote ? upvote.value : null;
  }

  @Mutation(() => UpvoteResponse)
  async vote(
    @Ctx() { req }: MyContext,
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
  ): Promise<UpvoteResponse> {
    // Check if the person has voted on the post
    let userId;
    if (req.headers.authorization) {
      let user: any;
      const token = req.headers.authorization.split("Bearer ")[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return null;
        }
        user = decodedToken;
        userId = user.userId;
        return;
      });
    }
    if (!userId) {
      return {
        errors: [
          {
            field: "User",
            message: "User not authenticated",
          },
        ],
      };
    }
    const checkUpvote = await Upvote.findOne({
      where: { creatorId: userId, postId: postId },
    });

    const post = await Post.findOne(postId);
    const user = await User.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: "User",
            message: "The user does not exist",
          },
        ],
      };
    }
    if (!post) {
      return {
        errors: [
          {
            field: "post",
            message: "post does not exist",
          },
        ],
      };
    }

    if (checkUpvote) {
      if (checkUpvote.value !== value) {
        checkUpvote.value = value;
        try {
          await checkUpvote.save();
        } catch (err) {
          console.log(err);
        }

        post.points = post.points + 2 * value;

        try {
          await post.save();
        } catch (err) {
          console.log(err);
        }
      }

      return {
        errors: [
          {
            field: "user",
            message: "user has already voted",
          },
        ],
      };
    }

    const upvote = new Upvote();
    upvote.postId = postId;
    upvote.post = post;
    upvote.creatorId = user.id;
    upvote.creator = user;
    upvote.value = value === 1 ? 1 : -1;

    try {
      await upvote.save();
    } catch (err) {
      console.log(err);
    }

    post.points = post.points + value;

    try {
      await post.save();
    } catch (err) {
      console.log(err);
    }

    return {
      upvote,
    };
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true })
    cursor: string | null,
  ): Promise<PaginatedPosts> {
    const connection = getConnection();

    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await connection.query(
      `
    select p.* 
    from post p
    ${cursor ? `where p."updatedAt" < $2` : ``}
    order by p."updatedAt" DESC
    limit $1
    `,
      replacements,
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => PaginatedPosts)
  async myCommunitiesPosts(
    @Ctx() { req }: MyContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true })
    cursor: string | null,
  ): Promise<PaginatedPosts> {
    const connection = getConnection();
    let userId;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(`Bearer `)[1];
      let user: UserDecoded | null | any;
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return {
            post: [],
            hasMore: false,
          };
        }

        user = decodedToken;
        return;
      });

      if (!user) {
        return {
          posts: [],
          hasMore: false,
        };
      }
      userId = user.userId;
    }

    const userRepository: Repository<User> = connection.getRepository(
      User,
    );
    const realLimit = Math.min(20, limit);
    const realLimitPlusOne = Math.min(20, limit) + 1;
    const replacements: any[] = [realLimitPlusOne];
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["memberCommunities"],
    });
    if (!user) {
      return {
        posts: [],
        hasMore: false,
        errors: [
          {
            field: "user",
            message: "User not found",
          },
        ],
      };
    }
    const communityIds = user.memberCommunities.map(
      (comm) => comm.id,
    );

    if (communityIds.length === 0) {
      return {
        posts: [],
        hasMore: false,
      };
    }
    const posts = await connection.query(
      `
    select p.*
    from post p
    where (p."communityId" in (${communityIds}))
    ${cursor ? `and p."createdAt" < $2` : ``}
    order by p.points DESC
    limit $1

    `,
      replacements,
    );
    return {
      posts: posts.slice(0, realLimit),
      hasMore: realLimitPlusOne === posts.length,
    };
  }

  @Query(() => PaginatedPosts, { nullable: true })
  async communityPosts(
    @Arg("communityId") communityId: number,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true })
    cursor: string | null,
  ): Promise<PaginatedPosts> {
    const connection = getConnection();
    const realLimit = Math.min(20, limit);
    const realLimitPlusOne = Math.min(20, limit) + 1;
    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await connection.query(
      `
      select p.* 
      from post p
      where (p."communityId" = ${communityId})
      ${cursor ? `and p."createdAt" < $2` : ``}
      order by p.points DESC
      limit $1
    `,
      replacements,
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.realLimitPlusOne === posts.length,
    };
  }

  @Query(() => Post)
  async post(@Arg("id") id: number): Promise<Post> {
    const post = await Post.find({
      where: { id },
      relations: allRelations,
    });
    return post[0];
  }

  @Mutation(() => PostResponse)
  async createPost(
    @Arg("title") title: string,
    @Arg("content") content: string,
    @Arg("communityId", () => Int) communityId: number,
    @Ctx() { req }: MyContext,
  ): Promise<PostResponse> {
    let userId;
    if (req.headers.authorization) {
      let user: any;
      const token = req.headers.authorization.split("Bearer ")[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return null;
        }
        user = decodedToken;
        userId = user.userId;
        return;
      });
    }
    if (!userId) {
      return {
        errors: [
          {
            field: "User",
            message: "User not authenticated",
          },
        ],
      };
    }
    if (communityId === undefined) {
      return {
        errors: [
          {
            field: "communityId",
            message: "Please select a community",
          },
        ],
      };
    }

    const community = await Community.findOne({
      where: { id: communityId },
    });
    if (!community) {
      return {
        errors: [
          {
            field: "community",
            message: "Community does not exist",
          },
        ],
      };
    }

    const connection = getConnection();
    const userRepository: Repository<User> = connection.getRepository(
      User,
    );

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["memberCommunities"],
    });

    if (!user) {
      return {
        errors: [
          {
            field: "user",
            message: "User not found",
          },
        ],
      };
    }

    const found = user.memberCommunities.find(
      (comm) => comm.id === communityId,
    );

    if (!found) {
      return {
        errors: [
          {
            field: "user",
            message: "User is not a member of the group",
          },
        ],
      };
    }

    const post = new Post();
    post.creator = user;
    post.community = community;
    post.title = title;
    post.content = content;
    post.creatorId = user.id;
    post.communityId = community.id;

    try {
      await post.save();
    } catch (err) {
      console.log(err);
    }

    return {
      post,
    };
  }

  @Mutation(() => PostResponse)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("content", () => String, { nullable: true }) content: string,
    @Ctx() { req }: MyContext,
  ): Promise<PostResponse> {
    let userId;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(`Bearer `)[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return false;
        }
        const user: any = decodedToken;
        userId = user.userId;
        return;
      });
    }
    if (!userId) {
      return {
        errors: [
          {
            field: "User",
            message: "User not authenticated",
          },
        ],
      };
    }
    const post = await Post.findOne(id);
    if (!post) {
      return {
        errors: [
          {
            field: "post",
            message: "The post does not exits",
          },
        ],
      };
    }
    if (post?.creatorId !== userId) {
      return {
        errors: [
          {
            field: "creator",
            message: "User not authorized",
          },
        ],
      };
    }

    if (title && post?.title) {
      post.title = title;
    }

    if (content && post?.content) {
      post.content = content;
    }

    try {
      await post.save();
    } catch (err) {
      console.log(err);
    }

    return {
      post,
    };
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext,
  ): Promise<Boolean> {
    let userId;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(`Bearer `)[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return false;
        }
        const user: any = decodedToken;
        userId = user.userId;
        return;
      });
    }
    if (!userId) {
      return false;
    }
    const post = await Post.findOne(id);
    if (!post) {
      console.log(`post not found`);
      return true;
    }

    if (post.creatorId !== userId) {
      console.log(`User not owner`);
      return true;
    }

    await Post.delete({ id });
    return true;
  }

  @Mutation(() => Boolean)
  async deletePosts(@Ctx() { req }: MyContext): Promise<Boolean> {
    let userId;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(`Bearer `)[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return false;
        }
        const user: any = decodedToken;
        userId = user.userId;
        return;
      });
    }
    if (!userId) {
      return false;
    }
    await Post.delete({});
    return true;
  }
}
