import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";
import { AuthenticationError } from "apollo-server-express";

export const isAuth: MiddlewareFn<MyContext> = (
  { context },
  next,
) => {
  if (!context.req.session.userId) {
    throw new AuthenticationError(`User is not authenticated`);
  }

  return next();
};
