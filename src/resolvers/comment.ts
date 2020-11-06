import { Post, User, UserComment } from "../entities";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { FieldError } from "./user";

@ObjectType()
export class UserCommentResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => UserComment, { nullable: true })
  comment?: UserComment;
}

@Resolver()
export default class UserCommentResolver {
  @Mutation(() => UserCommentResponse)
  async createComment(
    @Arg("content") content: string,
    @Arg("postId") postId: number,
    @Ctx() { req }: MyContext,
  ): Promise<UserCommentResponse> {
    if (!req.session.userId) {
      throw Error(`User not authenticated`);
    }

    const user = await User.findOne({
      where: { id: req.session.userId },
    });
    if (!user) {
      return {
        errors: [
          {
            field: "user",
            message: "user not found",
          },
        ],
      };
    }

    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      return {
        errors: [
          {
            field: "post",
            message: "Post not found",
          },
        ],
      };
    }

    const userComment = new UserComment();
    userComment.post = post;
    userComment.creator = user;
    userComment.content = content;

    try {
      await userComment.save();
    } catch (err) {
      console.log(err);
    }

    return {
      comment: userComment,
    };
  }

  @Mutation(() => Boolean)
  async deleteAllComments(): Promise<Boolean> {
    await UserComment.delete({});
    return true;
  }
}
