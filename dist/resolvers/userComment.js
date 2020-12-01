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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentUpvoteResponse = exports.UserCommentResponse = void 0;
const entities_1 = require("../entities");
const type_graphql_1 = require("type-graphql");
const user_1 = require("./user");
const typeorm_1 = require("typeorm");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = __importDefault(require("../constants"));
let UserCommentResponse = class UserCommentResponse {
};
__decorate([
    type_graphql_1.Field(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserCommentResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => entities_1.UserComment, { nullable: true }),
    __metadata("design:type", entities_1.UserComment)
], UserCommentResponse.prototype, "comment", void 0);
UserCommentResponse = __decorate([
    type_graphql_1.ObjectType()
], UserCommentResponse);
exports.UserCommentResponse = UserCommentResponse;
let CommentUpvoteResponse = class CommentUpvoteResponse {
};
__decorate([
    type_graphql_1.Field(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], CommentUpvoteResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => entities_1.CommentUpvote, { nullable: true }),
    __metadata("design:type", entities_1.CommentUpvote)
], CommentUpvoteResponse.prototype, "commentUpvote", void 0);
CommentUpvoteResponse = __decorate([
    type_graphql_1.ObjectType()
], CommentUpvoteResponse);
exports.CommentUpvoteResponse = CommentUpvoteResponse;
let UserCommentResolver = class UserCommentResolver {
    hasVoted(userComment, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(`Bearer `)[1];
                jsonwebtoken_1.default.verify(token, constants_1.default.JWT_SECRET, (err, decodedToken) => {
                    if (err) {
                        return false;
                    }
                    const user = decodedToken;
                    userId = user.userId;
                    return;
                });
            }
            const upvote = yield entities_1.CommentUpvote.findOne({
                where: { commentId: userComment.id, creatorId: userId },
            });
            if (upvote) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    voteStatus(userComment, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(`Bearer `)[1];
                jsonwebtoken_1.default.verify(token, constants_1.default.JWT_SECRET, (err, decodedToken) => {
                    if (err) {
                        return false;
                    }
                    const user = decodedToken;
                    userId = user.userId;
                    return;
                });
            }
            const upvote = yield entities_1.CommentUpvote.findOne({
                where: { commentId: userComment.id, creatorId: userId },
            });
            if (!upvote) {
                return null;
            }
            return upvote.value === 1 ? upvote.value : -1;
        });
    }
    isOwner(userComment, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(`Bearer `)[1];
                jsonwebtoken_1.default.verify(token, constants_1.default.JWT_SECRET, (err, decodedToken) => {
                    if (err) {
                        return false;
                    }
                    const user = decodedToken;
                    userId = user.userId;
                    return;
                });
            }
            const connection = typeorm_1.getConnection();
            const commentRepository = connection.getRepository(entities_1.UserComment);
            const comment = yield commentRepository.findOne({
                relations: ["creator"],
                where: { id: userComment.id },
            });
            if ((comment === null || comment === void 0 ? void 0 : comment.creator.id) === userId) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    voteComment(commentId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(`Bearer `)[1];
                jsonwebtoken_1.default.verify(token, constants_1.default.JWT_SECRET, (err, decodedToken) => {
                    if (err) {
                        return false;
                    }
                    const user = decodedToken;
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
            const user = yield entities_1.User.findOne({ id: userId });
            const comment = yield entities_1.UserComment.findOne({ id: commentId });
            if (!comment) {
                return {
                    errors: [
                        {
                            field: "commentId",
                            message: "The comment id is incorrect",
                        },
                    ],
                };
            }
            if (!user) {
                return {
                    errors: [
                        {
                            field: "user",
                            message: "Error in userId",
                        },
                    ],
                };
            }
            if (!(value === 1 || value === -1)) {
                return {
                    errors: [
                        {
                            field: "value",
                            message: "incorrect value",
                        },
                    ],
                };
            }
            const upvote = yield entities_1.CommentUpvote.findOne({
                where: { commentId: commentId, creatorId: userId },
            });
            if (upvote) {
                if (upvote.value === value) {
                    return {
                        errors: [
                            {
                                field: "user",
                                message: "user has already voted",
                            },
                        ],
                    };
                }
                else {
                    upvote.value = value;
                    try {
                        yield upvote.save();
                    }
                    catch (err) {
                        console.log(err);
                    }
                    comment.points = comment.points + value * 2;
                    try {
                        yield comment.save();
                    }
                    catch (err) {
                        console.log(err);
                    }
                    return {
                        commentUpvote: upvote,
                    };
                }
            }
            const newUpvote = new entities_1.CommentUpvote();
            newUpvote.creator = user;
            newUpvote.creatorId = user.id;
            newUpvote.comment = comment;
            newUpvote.commentId = commentId;
            newUpvote.value = value;
            try {
                yield newUpvote.save();
            }
            catch (err) {
                console.log(`Voting error`, err);
            }
            comment.points = comment.points + value;
            try {
                yield comment.save();
            }
            catch (err) {
                console.log(err);
            }
            return {
                commentUpvote: newUpvote,
            };
        });
    }
    createComment(content, postId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(`Bearer `)[1];
                jsonwebtoken_1.default.verify(token, constants_1.default.JWT_SECRET, (err, decodedToken) => {
                    if (err) {
                        return false;
                    }
                    const user = decodedToken;
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
            const user = yield entities_1.User.findOne({
                where: { id: userId },
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
            const post = yield entities_1.Post.findOne({ where: { id: postId } });
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
            const userComment = new entities_1.UserComment();
            userComment.post = post;
            userComment.creator = user;
            userComment.content = content;
            try {
                yield userComment.save();
            }
            catch (err) {
                console.log(err);
            }
            return {
                comment: userComment,
            };
        });
    }
    postComments(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield entities_1.Post.findOne({ id: postId });
            const connection = typeorm_1.getConnection();
            const commentRepository = connection.getRepository(entities_1.UserComment);
            const comments = yield commentRepository.find({
                relations: ["post", "creator"],
                where: { post },
            });
            return comments;
        });
    }
    deleteAllComments({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(`Bearer `)[1];
                jsonwebtoken_1.default.verify(token, constants_1.default.JWT_SECRET, (err, decodedToken) => {
                    if (err) {
                        return false;
                    }
                    const user = decodedToken;
                    userId = user.userId;
                    return;
                });
            }
            if (!userId) {
                return false;
            }
            yield entities_1.UserComment.delete({});
            return true;
        });
    }
    deleteComment(commentId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId;
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(`Bearer `)[1];
                jsonwebtoken_1.default.verify(token, constants_1.default.JWT_SECRET, (err, decodedToken) => {
                    if (err) {
                        return false;
                    }
                    const user = decodedToken;
                    userId = user.userId;
                    return;
                });
            }
            if (!userId) {
                return false;
            }
            const connection = typeorm_1.getConnection();
            const commentRepository = connection.getRepository(entities_1.UserComment);
            const comment = yield commentRepository.findOne({
                where: { id: commentId },
                relations: ["creator"],
            });
            if (!comment) {
                console.log("commentId error");
                return false;
            }
            if (comment.creator.id !== userId) {
                console.log(`User not authorized`);
                return false;
            }
            try {
                yield commentRepository.delete({ id: commentId });
            }
            catch (err) {
                console.log(err);
                return false;
            }
            return true;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => Boolean),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserComment, Object]),
    __metadata("design:returntype", Promise)
], UserCommentResolver.prototype, "hasVoted", null);
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Int, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserComment, Object]),
    __metadata("design:returntype", Promise)
], UserCommentResolver.prototype, "voteStatus", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.UserComment, Object]),
    __metadata("design:returntype", Promise)
], UserCommentResolver.prototype, "isOwner", null);
__decorate([
    type_graphql_1.Mutation(() => CommentUpvoteResponse),
    __param(0, type_graphql_1.Arg("commentId")),
    __param(1, type_graphql_1.Arg("value", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], UserCommentResolver.prototype, "voteComment", null);
__decorate([
    type_graphql_1.Mutation(() => UserCommentResponse),
    __param(0, type_graphql_1.Arg("content")),
    __param(1, type_graphql_1.Arg("postId")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], UserCommentResolver.prototype, "createComment", null);
__decorate([
    type_graphql_1.Query(() => [entities_1.UserComment], { nullable: true }),
    __param(0, type_graphql_1.Arg("postId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserCommentResolver.prototype, "postComments", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserCommentResolver.prototype, "deleteAllComments", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("commentId")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserCommentResolver.prototype, "deleteComment", null);
UserCommentResolver = __decorate([
    type_graphql_1.Resolver(entities_1.UserComment)
], UserCommentResolver);
exports.default = UserCommentResolver;
//# sourceMappingURL=userComment.js.map