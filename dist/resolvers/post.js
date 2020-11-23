"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedPosts = exports.UpvoteResponse = exports.PostResponse = void 0;
const type_graphql_1 = require("type-graphql");
const user_1 = require("./user");
const entities_1 = require("../entities");
const typeorm_1 = require("typeorm");
const allRelations = ["community", "comments", "upvotes"];
let PostResponse = class PostResponse {
};
__decorate([
    type_graphql_1.Field(() => entities_1.Post, { nullable: true }),
    __metadata("design:type", entities_1.Post)
], PostResponse.prototype, "post", void 0);
__decorate([
    type_graphql_1.Field(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], PostResponse.prototype, "errors", void 0);
PostResponse = __decorate([
    type_graphql_1.ObjectType()
], PostResponse);
exports.PostResponse = PostResponse;
let UpvoteResponse = class UpvoteResponse {
};
__decorate([
    type_graphql_1.Field(() => entities_1.Upvote, { nullable: true }),
    __metadata("design:type", entities_1.Upvote)
], UpvoteResponse.prototype, "upvote", void 0);
__decorate([
    type_graphql_1.Field(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UpvoteResponse.prototype, "errors", void 0);
UpvoteResponse = __decorate([
    type_graphql_1.ObjectType()
], UpvoteResponse);
exports.UpvoteResponse = UpvoteResponse;
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    type_graphql_1.Field(() => [entities_1.Post], { nullable: true }),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
__decorate([
    type_graphql_1.Field(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "errors", void 0);
PaginatedPosts = __decorate([
    type_graphql_1.ObjectType()
], PaginatedPosts);
exports.PaginatedPosts = PaginatedPosts;
let PostResolver = class PostResolver {
    contentSnippet(post) {
        return post.content.slice(0, 50);
    }
    isOwner(post, { req }) {
        if (req.session.userId === post.creatorId) {
            return true;
        }
        else {
            return false;
        }
    }
    creator(post, { userLoader }) {
        return userLoader.load(post.creatorId);
    }
    community(post, { communityLoader }) {
        return communityLoader.load(post.communityId);
    }
    joinStatus(post, { communityLoader, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const community = yield communityLoader.load(post.communityId);
            const userId = req.session.userId;
            const found = community.memberIds.find((commId) => commId === userId);
            if (found) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    hasVoted(post, { req, upvoteLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.session.userId;
            const upvote = yield upvoteLoader.load({
                postId: post.id,
                creatorId: userId,
            });
            return upvote ? upvote.value : null;
        });
    }
    vote({ req }, postId, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return {
                    errors: [
                        {
                            field: "User",
                            message: "User not authenticated",
                        },
                    ],
                };
            }
            const checkUpvote = yield entities_1.Upvote.findOne({
                where: { creatorId: req.session.userId, postId: postId },
            });
            const post = yield entities_1.Post.findOne(postId);
            const user = yield entities_1.User.findOne(req.session.userId);
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
                        yield checkUpvote.save();
                    }
                    catch (err) {
                        console.log(err);
                    }
                    post.points = post.points + 2 * value;
                    try {
                        yield post.save();
                    }
                    catch (err) {
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
            const upvote = new entities_1.Upvote();
            upvote.postId = postId;
            upvote.post = post;
            upvote.creatorId = user.id;
            upvote.creator = user;
            upvote.value = value === 1 ? 1 : -1;
            try {
                yield upvote.save();
            }
            catch (err) {
                console.log(err);
            }
            post.points = post.points + value;
            try {
                yield post.save();
            }
            catch (err) {
                console.log(err);
            }
            return {
                upvote,
            };
        });
    }
    deleteAllUpvote({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return false;
            }
            yield entities_1.Upvote.delete({});
            return true;
        });
    }
    posts(limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = typeorm_1.getConnection();
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const posts = yield connection.query(`
    select p.* 
    from post p
    ${cursor ? `where p."createdAt" < $2` : ``}
    order by p.points DESC
    limit $1
    `, replacements);
            return {
                posts: posts.slice(0, realLimit),
                hasMore: posts.length === realLimitPlusOne,
            };
        });
    }
    myCommunitiesPosts({ req }, limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = typeorm_1.getConnection();
            const userRepository = connection.getRepository(entities_1.User);
            const realLimit = Math.min(20, limit);
            const realLimitPlusOne = Math.min(20, limit) + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const user = yield userRepository.findOne({
                where: { id: req.session.userId },
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
            const communityIds = user.memberCommunities.map((comm) => comm.id);
            if (communityIds.length === 0) {
                return {
                    posts: [],
                    hasMore: false,
                };
            }
            const posts = yield connection.query(`
    select p.*
    from post p
    where (p."communityId" in (${communityIds}))
    ${cursor ? `and p."createdAt" < $2` : ``}
    order by p.points DESC
    limit $1

    `, replacements);
            return {
                posts: posts.slice(0, realLimit),
                hasMore: realLimitPlusOne === posts.length,
            };
        });
    }
    communityPosts(communityId, limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = typeorm_1.getConnection();
            const realLimit = Math.min(20, limit);
            const realLimitPlusOne = Math.min(20, limit) + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const posts = yield connection.query(`
      select p.* 
      from post p
      where (p."communityId" = ${communityId})
      ${cursor ? `and p."createdAt" < $2` : ``}
      order by p.points DESC
      limit $1
    `, replacements);
            return {
                posts: posts.slice(0, realLimit),
                hasMore: posts.realLimitPlusOne === posts.length,
            };
        });
    }
    post(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield entities_1.Post.find({
                where: { id },
                relations: allRelations,
            });
            return post[0];
        });
    }
    createPost(title, content, communityId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
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
            const community = yield entities_1.Community.findOne({
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
            const connection = typeorm_1.getConnection();
            const userRepository = connection.getRepository(entities_1.User);
            const user = yield userRepository.findOne({
                where: { id: req.session.userId },
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
            const found = user.memberCommunities.find((comm) => comm.id === communityId);
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
            const post = new entities_1.Post();
            post.creator = user;
            post.community = community;
            post.title = title;
            post.content = content;
            post.creatorId = user.id;
            post.communityId = community.id;
            try {
                yield post.save();
            }
            catch (err) {
                console.log(err);
            }
            return {
                post,
            };
        });
    }
    updatePost(id, title, content, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return {
                    errors: [
                        {
                            field: "User",
                            message: "User not authenticated",
                        },
                    ],
                };
            }
            const post = yield entities_1.Post.findOne(id);
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
            if ((post === null || post === void 0 ? void 0 : post.creatorId) !== req.session.userId) {
                return {
                    errors: [
                        {
                            field: "creator",
                            message: "User not authorized",
                        },
                    ],
                };
            }
            if (title && (post === null || post === void 0 ? void 0 : post.title)) {
                post.title = title;
            }
            if (content && (post === null || post === void 0 ? void 0 : post.content)) {
                post.content = content;
            }
            try {
                yield post.save();
            }
            catch (err) {
                console.log(err);
            }
            return {
                post,
            };
        });
    }
    deletePost(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return false;
            }
            const post = yield entities_1.Post.findOne(id);
            if (!post) {
                console.log(`post not found`);
                return true;
            }
            if (post.creatorId !== req.session.userId) {
                console.log(`User not owner`);
                return true;
            }
            yield entities_1.Post.delete({ id });
            return true;
        });
    }
    deletePosts({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return false;
            }
            yield entities_1.Post.delete({});
            return true;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "contentSnippet", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Post, Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "isOwner", null);
__decorate([
    type_graphql_1.FieldResolver(() => entities_1.User),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Post, Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "creator", null);
__decorate([
    type_graphql_1.FieldResolver(() => entities_1.Community),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Post, Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "community", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "joinStatus", null);
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Int, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "hasVoted", null);
__decorate([
    type_graphql_1.Mutation(() => UpvoteResponse),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("postId", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("value", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deleteAllUpvote", null);
__decorate([
    type_graphql_1.Query(() => PaginatedPosts),
    __param(0, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    type_graphql_1.Query(() => PaginatedPosts),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "myCommunitiesPosts", null);
__decorate([
    type_graphql_1.Query(() => PaginatedPosts, { nullable: true }),
    __param(0, type_graphql_1.Arg("communityId")),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "communityPosts", null);
__decorate([
    type_graphql_1.Query(() => entities_1.Post),
    __param(0, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    type_graphql_1.Mutation(() => PostResponse),
    __param(0, type_graphql_1.Arg("title")),
    __param(1, type_graphql_1.Arg("content")),
    __param(2, type_graphql_1.Arg("communityId", () => type_graphql_1.Int)),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Mutation(() => PostResponse),
    __param(0, type_graphql_1.Arg("id")),
    __param(1, type_graphql_1.Arg("title", () => String, { nullable: true })),
    __param(2, type_graphql_1.Arg("content", () => String, { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePosts", null);
PostResolver = __decorate([
    type_graphql_1.Resolver(entities_1.Post)
], PostResolver);
exports.default = PostResolver;
//# sourceMappingURL=post.js.map