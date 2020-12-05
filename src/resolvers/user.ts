import { MyContext } from "src/types";
import constants from "../constants";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { validateUserRegisterInput } from "../utils/validateUserInput";
import { getConnection, Repository } from "typeorm";
import { User } from "../entities";

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

export interface UserDecoded {
  email: string;
}

@InputType()
export class UserRegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => String, { nullable: true })
  token?: string;
}

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    const users = await User.find({});
    return users;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserResponse> {
    const errors = validateUserRegisterInput({
      username,
      email,
      password,
    });
    if (errors.length > 0) {
      return {
        errors,
      };
    }

    const hashedPassword = await argon2.hash(password);
    const user = User.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    try {
      await User.save(user);
    } catch (err) {
      if (
        err.detail.includes("already exists") &&
        err.constraint === "UQ_78a916df40e02a9deb1c4b75edb"
      ) {
        return {
          errors: [
            {
              field: "username",
              message: "username already exists",
            },
          ],
        };
      }

      if (
        err.detail.includes("already exists") &&
        err.constraint === "UQ_e12875dfb3b1d92d7d7c5377e22"
      ) {
        return {
          errors: [
            {
              field: "email",
              message: "A user of this email already exists",
            },
          ],
        };
      }
    }

    const userId = user.id;
    const token = jwt.sign({ userId }, constants.JWT_SECRET, {
      expiresIn: 60 * 60 * 4,
    });

    return {
      user,
      token,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "The username or email does not exist",
          },
        ],
      };
    }

    const verifyPassword = await argon2.verify(user.password, password);

    if (!verifyPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect Password",
          },
        ],
      };
    }

    const userId = user.id;

    const token = jwt.sign({ userId }, constants.JWT_SECRET, {
      expiresIn: 60 * 60 * 4,
    });

    return {
      user,
      token,
    };
  }

  @Mutation(() => Boolean) logout(): boolean {
    return true;
  }

  // @Mutation(() => Boolean)
  // async forgotPassword(
  //   @Arg("email") email: string,
  //   @Ctx() { redis }: MyContext,
  // ) {
  //   const user = await User.findOne({ where: { email } });

  //   if (!user) {
  //     return true;
  //   }

  //   const token = v4();

  //   redis.set(
  //     constants.FORGOT_PASSWORD + token,
  //     user.id,
  //     "ex",
  //     1000 * 60 * 60 * 4,
  //   );

  //   sendMail(
  //     user.email,
  //     `<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`,
  //   );

  //   return true;
  // }

  // @Mutation(() => UserResponse)
  // async resetPassword(
  //   @Arg("token") token: string,
  //   @Arg("password") password: string,
  //   @Ctx() { redis }: MyContext,
  // ): Promise<UserResponse> {
  //   const key = constants.FORGOT_PASSWORD + token;
  //   const userId = await redis.get(key);
  //   if (!userId) {
  //     return {
  //       errors: [
  //         {
  //           field: "password",
  //           message: "Token has expired",
  //         },
  //       ],
  //     };
  //   }

  //   if (password.length < 4) {
  //     return {
  //       errors: [
  //         {
  //           field: "password",
  //           message: "Choose a longer password",
  //         },
  //       ],
  //     };
  //   }

  //   const user = await User.findOne(parseInt(userId));
  //   if (!user) {
  //     return {
  //       errors: [
  //         {
  //           field: "password",
  //           message: "Token has expired",
  //         },
  //       ],
  //     };
  //   }

  //   const hashedPassword = await argon2.hash(password);
  //   user.password = hashedPassword;
  //   user.save();

  //   await redis.del(key);
  //   return {
  //     user,
  //   };
  // }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null | undefined> {
    let user: any;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(`Bearer `)[1];
      jwt.verify(token, constants.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return null;
        }

        user = decodedToken;
        return;
      });
    }
    if (!user) {
      return null;
    }

    const currentUser = await User.findOne({ id: user.userId });

    return currentUser;
  }

  @Query(() => User, { nullable: true })
  async meWithCommunities(@Ctx() { req }: MyContext) {
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
      return null;
    }
    const connection = getConnection();
    const userRepository: Repository<User> = connection.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["memberCommunities"],
    });

    return user;
  }
}
