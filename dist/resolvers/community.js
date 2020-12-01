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
exports.BooleanFieldResponse = exports.CommunityResponse = void 0;
const type_graphql_1 = require("type-graphql");
const user_1 = require("./user");
const typeorm_1 = require("typeorm");
const entities_1 = require("../entities");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = __importDefault(require("../constants"));
const allRelations = ["posts", "favoriteBooks"];
let CommunityResponse = class CommunityResponse {
};
__decorate([
    type_graphql_1.Field(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], CommunityResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => entities_1.Community, { nullable: true }),
    __metadata("design:type", entities_1.Community)
], CommunityResponse.prototype, "community", void 0);
CommunityResponse = __decorate([
    type_graphql_1.ObjectType()
], CommunityResponse);
exports.CommunityResponse = CommunityResponse;
let BooleanFieldResponse = class BooleanFieldResponse {
};
__decorate([
    type_graphql_1.Field(() => [user_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], BooleanFieldResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], BooleanFieldResponse.prototype, "ok", void 0);
BooleanFieldResponse = __decorate([
    type_graphql_1.ObjectType()
], BooleanFieldResponse);
exports.BooleanFieldResponse = BooleanFieldResponse;
let CommunityResolver = class CommunityResolver {
    creator(community, { userLoader }) {
        return userLoader.load(community.creatorId);
    }
    members(community, { userLoader }) {
        return userLoader.loadMany(community.memberIds);
    }
    hasJoined(community, { req }) {
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
        const found = community.memberIds.find((commId) => commId === userId);
        if (found) {
            return true;
        }
        else {
            return false;
        }
    }
    dateCreated(community) {
        const dateString = String(community.createdAt);
        const date = new Date(dateString);
        const month = date.toLocaleString(`default`, { month: "long" });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    }
    allCommunities() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = typeorm_1.getConnection();
            const communityRepository = connection.getRepository(entities_1.Community);
            const communities = yield communityRepository.find({
                relations: allRelations,
            });
            return communities;
        });
    }
    community(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = typeorm_1.getConnection();
            const communityRepository = connection.getRepository(entities_1.Community);
            const community = yield communityRepository.findOne({
                where: { id },
                relations: ["creator"],
            });
            return community;
        });
    }
    createCommunity({ req }, name, description) {
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
                            message: "User not authorized",
                        },
                    ],
                };
            }
            const user = yield entities_1.User.findOne({
                where: { id: userId },
            });
            const connection = typeorm_1.getConnection();
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
            const community = new entities_1.Community();
            community.name = name.toLowerCase();
            community.creator = user;
            community.members = [user];
            community.description = description;
            community.creatorId = user.id;
            community.memberIds = [user.id];
            try {
                yield connection.manager.save(community);
            }
            catch (err) {
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
        });
    }
    joinCommunity({ req }, id) {
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
                    ok: false,
                    errors: [
                        {
                            field: "User",
                            message: "User not authenticated",
                        },
                    ],
                };
            }
            const user = yield entities_1.User.findOne({ where: { id: userId } });
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
            const community = yield entities_1.Community.findOne({ id }, { relations: ["members"] });
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
                yield community.save();
            }
            catch (err) {
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
        });
    }
    leaveCommunity({ req }, communityId) {
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
                    ok: false,
                    errors: [
                        {
                            field: "User",
                            message: "User not authenticated",
                        },
                    ],
                };
            }
            const connection = typeorm_1.getConnection();
            const communityRepository = connection.getRepository(entities_1.Community);
            const user = yield entities_1.User.findOne({ id: userId });
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
            const community = yield communityRepository.findOne({
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
            const newMembers = community.members.filter((member) => member.id !== user.id);
            const newMemberIds = community.memberIds.filter((id) => id !== user.id);
            community.members = newMembers;
            community.memberIds = newMemberIds;
            try {
                yield community.save();
            }
            catch (err) {
                console.log(err);
            }
            return {
                ok: true,
            };
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => entities_1.User),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Community, Object]),
    __metadata("design:returntype", void 0)
], CommunityResolver.prototype, "creator", null);
__decorate([
    type_graphql_1.FieldResolver(() => [entities_1.User]),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Community, Object]),
    __metadata("design:returntype", void 0)
], CommunityResolver.prototype, "members", null);
__decorate([
    type_graphql_1.FieldResolver(() => Boolean),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Community, Object]),
    __metadata("design:returntype", void 0)
], CommunityResolver.prototype, "hasJoined", null);
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Community]),
    __metadata("design:returntype", void 0)
], CommunityResolver.prototype, "dateCreated", null);
__decorate([
    type_graphql_1.Query(() => [entities_1.Community]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "allCommunities", null);
__decorate([
    type_graphql_1.Query(() => entities_1.Community),
    __param(0, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "community", null);
__decorate([
    type_graphql_1.Mutation(() => CommunityResponse),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("name")),
    __param(2, type_graphql_1.Arg("description")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "createCommunity", null);
__decorate([
    type_graphql_1.Mutation(() => BooleanFieldResponse),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "joinCommunity", null);
__decorate([
    type_graphql_1.Mutation(() => BooleanFieldResponse),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("communityId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommunityResolver.prototype, "leaveCommunity", null);
CommunityResolver = __decorate([
    type_graphql_1.Resolver(entities_1.Community)
], CommunityResolver);
exports.default = CommunityResolver;
//# sourceMappingURL=community.js.map