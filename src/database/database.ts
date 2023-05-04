import "reflect-metadata";
import { DataSource } from "typeorm";
import { getEnvironmentVariables } from "../config/env";
import path from "path";
import {
  Author,
  Book,
  Community,
  Genre,
  Review,
  Shelf,
  Upvote,
  UserComment,
  User,
  Post,
  CommentUpvote,
} from "../entities";

const env = getEnvironmentVariables();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  logging: true,
  synchronize: true,
  entities: [
    Author,
    Book,
    Community,
    Genre,
    Review,
    Shelf,
    Upvote,
    UserComment,
    User,
    Post,
    CommentUpvote,
  ],
  migrations: [path.join(__dirname, "./migration/*")],
  migrationsTableName: "bookclub_migration_table",
});
