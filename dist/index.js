"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const ioredis_1 = __importDefault(require("ioredis"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const entities_1 = require("./entities");
const resolvers_1 = require("./resolvers");
const createUserLoader_1 = require("./utils/createUserLoader");
const createCommunityLoader_1 = require("./utils/createCommunityLoader");
const createUpvoteLoader_1 = require("./utils/createUpvoteLoader");
const config_1 = __importDefault(require("./config"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield typeorm_1.createConnection({
        type: "postgres",
        url: config_1.default.databaseUrl,
        logging: true,
        synchronize: true,
        entities: [
            entities_1.Author,
            entities_1.Book,
            entities_1.Community,
            entities_1.Genre,
            entities_1.Review,
            entities_1.Shelf,
            entities_1.Upvote,
            entities_1.UserComment,
            entities_1.User,
            entities_1.Post,
            entities_1.CommentUpvote,
        ],
        migrations: [path_1.default.join(__dirname, "./migration/*")],
        migrationsTableName: "bookclub_migration_table",
        cli: {
            migrationsDir: "migration",
        },
    });
    const app = express_1.default();
    const redis = new ioredis_1.default(config_1.default.redisUrl, {
        password: config_1.default.redisPassword,
    });
    app.use(cors_1.default({
        origin: config_1.default.corsOriginUrl,
        credentials: true,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [
                resolvers_1.UserResolver,
                resolvers_1.CommunityResolver,
                resolvers_1.PostResolver,
                resolvers_1.UserCommentResolver,
            ],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader_1.createUserLoader(),
            communityLoader: createCommunityLoader_1.createCommunityLoader(),
            upvoteLoader: createUpvoteLoader_1.createUpvoteLoader(),
        }),
    });
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(config_1.default.port, () => {
        console.log(`Server running at port ${config_1.default.port}`);
    });
});
main().catch((err) => console.log(err));
//# sourceMappingURL=index.js.map