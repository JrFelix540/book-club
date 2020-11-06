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
import { validateUserRegisterInput } from "../utils/validateUserInput";
import { v4 } from "uuid";
import { sendMail } from "../utils/sendMail";
import { getConnection, Repository } from "typeorm";
import { User } from "../entities";

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
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

@InputType()
class UserLoginInput {
  @Field()
  usernameOrEmail: string;

  @Field()
  password: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export default class UserResolver {
  @Query(() => String)
  hello() {
    return `Hello, its me`;
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    const users = await User.find({});
    return users;
  }

  @Mutation(() => UserResponse)
  async register(
    @Ctx() { req }: MyContext,
    @Arg("userInput") userInput: UserRegisterInput,
  ): Promise<UserResponse> {
    const errors = validateUserRegisterInput(userInput);
    if (errors.length > 0) {
      return {
        errors,
      };
    }

    const hashedPassword = await argon2.hash(userInput.password);
    const user = User.create({
      username: userInput.username,
      email: userInput.email,
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

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Ctx() { req }: MyContext,
    @Arg("userInput") userInput: UserLoginInput,
  ): Promise<UserResponse> {
    const user = await User.findOne(
      userInput.usernameOrEmail.includes("@")
        ? { where: { email: userInput.usernameOrEmail } }
        : { where: { username: userInput.usernameOrEmail } },
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

    const verifyPassword = await argon2.verify(
      user.password,
      userInput.password,
    );

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

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(constants.USERID_COOKIE);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        return resolve(true);
      }),
    );
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext,
  ) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return true;
    }

    const token = v4();

    redis.set(
      constants.FORGOT_PASSWORD + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 4,
    );

    sendMail(
      user.email,
      `<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`,
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("password") password: string,
    @Ctx() { redis }: MyContext,
  ): Promise<UserResponse> {
    const key = constants.FORGOT_PASSWORD + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "password",
            message: "Token has expired",
          },
        ],
      };
    }

    if (password.length < 4) {
      return {
        errors: [
          {
            field: "password",
            message: "Choose a longer password",
          },
        ],
      };
    }

    const user = await User.findOne(parseInt(userId));
    if (!user) {
      return {
        errors: [
          {
            field: "password",
            message: "Token has expired",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(password);
    user.password = hashedPassword;
    user.save();

    await redis.del(key);
    return {
      user,
    };
  }

  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req }: MyContext,
  ): Promise<User | null | undefined> {
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne(req.session.userId);
    return user;
  }

  @Mutation(() => Boolean)
  async deleteUsers(): Promise<boolean> {
    await User.delete({});
    return true;
  }

  @Query(() => User, { nullable: true })
  async meWithCommunities(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const connection = getConnection();
    const userRepository: Repository<User> = connection.getRepository(
      User,
    );

    const user = await userRepository.findOne({
      where: { id: req.session.userId },
      relations: ["memberCommunities"],
    });

    return user;
  }
}
