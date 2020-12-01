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
import { FieldError } from "./user";
import { getConnection, Repository } from "typeorm";
import { User, Community } from "../entities";
import jwt from "jsonwebtoken";
import constants from "../constants";

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
export default class CommunityResolver {
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

  @FieldResolver(() => Boolean)
  hasJoined(@Root() community: Community, @Ctx() { req }: MyContext) {
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

    const found = community.memberIds.find(
      (commId) => commId === userId,
    );

    if (found) {
      return true;
    } else {
      return false;
    }
  }

  @FieldResolver(() => String)
  dateCreated(@Root() community: Community) {
    const dateString = String(community.createdAt);
    const date = new Date(dateString);
    const month = date.toLocaleString(`default`, { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
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
      relations: ["creator"],
    });
    return community;
  }

  @Mutation(() => CommunityResponse)
  async createCommunity(
    @Ctx() { req }: MyContext,
    @Arg("name") name: string,
    @Arg("description") description: string,
  ): Promise<CommunityResponse> {
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
            message: "User not authorized",
          },
        ],
      };
    }
    const user = await User.findOne({
      where: { id: userId },
    });

    const connection = getConnection();
    if (!user) {
      return {
        errors: [
          {
            field: "User",
            message: "User is not authenticated",
          },
        ],
      };
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
        ok: false,
        errors: [
          {
            field: "User",
            message: "User not authenticated",
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

  @Mutation(() => BooleanFieldResponse)
  async leaveCommunity(
    @Ctx() { req }: MyContext,
    @Arg("communityId") communityId: number,
  ): Promise<BooleanFieldResponse> {
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
        ok: false,
        errors: [
          {
            field: "User",
            message: "User not authenticated",
          },
        ],
      };
    }
    const connection = getConnection();
    const communityRepository: Repository<Community> = connection.getRepository(
      Community,
    );

    const user = await User.findOne({ id: userId });
    if (!user) {
      return {
        errors: [
          {
            field: `User`,
            message: `User is not authenticated`,
          },
        ],
      };
    }

    const community = await communityRepository.findOne({
      where: { id: communityId },
      relations: ["members"],
    });
    if (!community) {
      return {
        errors: [
          {
            field: "communityId",
            message: "community id error",
          },
        ],
      };
    }

    const newMembers = community.members.filter(
      (member) => member.id !== user.id,
    );
    const newMemberIds = community.memberIds.filter(
      (id) => id !== user.id,
    );
    community.members = newMembers;
    community.memberIds = newMemberIds;

    try {
      await community.save();
    } catch (err) {
      console.log(err);
    }

    return {
      ok: true,
    };
  }
}
