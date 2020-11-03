import { User } from "../entities/User";
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
import { Community } from "../entities/Community";
import { FieldError } from "./user";
import { getConnection, Repository } from "typeorm";

const allRelations: string[] = ["posts", "favoriteBooks"];

@ObjectType()
export class CommunityResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Community, { nullable: true })
  community?: Community;
}

@ObjectType()
export class BooleanFieldResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { nullable: true })
  ok?: boolean;
}

@Resolver(Community)
export class CommunityResolver {
  // Dataclasses
  @FieldResolver(() => User)
  creator(
    @Root() community: Community,
    @Ctx() { userLoader }: MyContext,
  ) {
    return userLoader.load(community.creatorId);
  }

  @FieldResolver(() => [User])
  members(
    @Root() community: Community,
    @Ctx() { userLoader }: MyContext,
  ) {
    return userLoader.loadMany(community.memberIds);
  }

  @Query(() => [Community])
  async allCommunities() {
    const connection = getConnection();
    const communityRepository: Repository<Community> = connection.getRepository(
      Community,
    );
    const communities = await communityRepository.find({
      relations: allRelations,
    });
    return communities;
  }

  @Query(() => Community)
  async community(@Arg("id") id: number) {
    const connection = getConnection();
    const communityRepository: Repository<Community> = connection.getRepository(
      Community,
    );
    const community = await communityRepository.findOne({
      where: { id },
      relations: allRelations,
    });
    return community;
  }

  @Mutation(() => CommunityResponse)
  async createCommunity(
    @Ctx() { req }: MyContext,
    @Arg("name") name: string,
    @Arg("description") description: string,
  ): Promise<CommunityResponse> {
    const user = await User.findOne({
      where: { id: req.session.userId },
    });

    const connection = getConnection();
    if (!user) {
      throw Error(`User is not authenticated`);
    }

    const community = new Community();
    community.name = name.toLowerCase();
    community.creator = user;
    community.members = [user];
    community.description = description;
    community.creatorId = user.id;
    community.memberIds = [user.id];

    try {
      await connection.manager.save(community);
    } catch (err) {
      if (err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "name",
              message: "Another group of the same name exists!",
            },
          ],
        };
      }

      console.log(err);
    }

    return {
      community,
    };
  }

  @Mutation(() => BooleanFieldResponse)
  async joinCommunity(
    @Ctx() { req }: MyContext,
    @Arg("id", () => Int) id: number,
  ): Promise<BooleanFieldResponse> {
    const { userId } = req.session;
    if (!userId) {
      return {
        errors: [
          {
            field: "user",
            message: "User is not authenticated",
          },
        ],
      };
    }
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return {
        errors: [
          {
            field: "user",
            message: "User has not been found",
          },
        ],
      };
    }
    const community = await Community.findOne(
      { id },
      { relations: ["members"] },
    );
    if (!community) {
      return {
        errors: [
          {
            field: "community",
            message: "error in fetching community",
          },
        ],
      };
    }

    const exists = community.memberIds.find((id) => id === user.id);

    if (exists) {
      return {
        errors: [
          {
            field: "message",
            message: "User has already joined the group",
          },
        ],
      };
    }

    community.members = [...community.members, user];
    community.memberIds = [...community.memberIds, user.id];

    try {
      await community.save();
    } catch (err) {
      console.log(err);

      if (err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "community",
              message: `You've already joined this community`,
            },
          ],
        };
      }
    }

    return {
      ok: true,
    };
  }

  @Mutation(() => Boolean)
  async deleteAllCommunities() {
    await Community.delete({});

    return true;
  }
}
