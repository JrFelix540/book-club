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
exports.UserRegisterInput = exports.FieldError = void 0;
const constants_1 = __importDefault(require("../constants"));
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateUserInput_1 = require("../utils/validateUserInput");
const uuid_1 = require("uuid");
const sendMail_1 = require("../utils/sendMail");
const typeorm_1 = require("typeorm");
const entities_1 = require("../entities");
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
exports.FieldError = FieldError;
let UserRegisterInput = class UserRegisterInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserRegisterInput.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserRegisterInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UserRegisterInput.prototype, "password", void 0);
UserRegisterInput = __decorate([
    type_graphql_1.InputType()
], UserRegisterInput);
exports.UserRegisterInput = UserRegisterInput;
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => entities_1.User, { nullable: true }),
    __metadata("design:type", entities_1.User)
], UserResponse.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserResponse.prototype, "token", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let UserResolver = class UserResolver {
    users() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield entities_1.User.find({});
            return users;
        });
    }
    register(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = validateUserInput_1.validateUserRegisterInput({
                username,
                email,
                password,
            });
            if (errors.length > 0) {
                return {
                    errors,
                };
            }
            const hashedPassword = yield argon2_1.default.hash(password);
            const user = entities_1.User.create({
                username: username,
                email: email,
                password: hashedPassword,
            });
            try {
                yield entities_1.User.save(user);
            }
            catch (err) {
                if (err.detail.includes("already exists") &&
                    err.constraint === "UQ_78a916df40e02a9deb1c4b75edb") {
                    return {
                        errors: [
                            {
                                field: "username",
                                message: "username already exists",
                            },
                        ],
                    };
                }
                if (err.detail.includes("already exists") &&
                    err.constraint === "UQ_e12875dfb3b1d92d7d7c5377e22") {
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
            const token = jsonwebtoken_1.default.sign({ userId }, constants_1.default.JWT_SECRET, {
                expiresIn: 60 * 60 * 4,
            });
            return {
                user,
                token,
            };
        });
    }
    login(usernameOrEmail, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield entities_1.User.findOne(usernameOrEmail.includes("@")
                ? { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail } });
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
            const verifyPassword = yield argon2_1.default.verify(user.password, password);
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
            const token = jsonwebtoken_1.default.sign({ userId }, constants_1.default.JWT_SECRET, {
                expiresIn: 60 * 60 * 4,
            });
            return {
                user,
                token,
            };
        });
    }
    logout() {
        return true;
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield entities_1.User.findOne({ where: { email } });
            if (!user) {
                return true;
            }
            const token = uuid_1.v4();
            redis.set(constants_1.default.FORGOT_PASSWORD + token, user.id, "ex", 1000 * 60 * 60 * 4);
            sendMail_1.sendMail(user.email, `<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`);
            return true;
        });
    }
    resetPassword(token, password, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = constants_1.default.FORGOT_PASSWORD + token;
            const userId = yield redis.get(key);
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
            const user = yield entities_1.User.findOne(parseInt(userId));
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
            const hashedPassword = yield argon2_1.default.hash(password);
            user.password = hashedPassword;
            user.save();
            yield redis.del(key);
            return {
                user,
            };
        });
    }
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let user;
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(`Bearer `)[1];
                jsonwebtoken_1.default.verify(token, constants_1.default.JWT_SECRET, (err, decodedToken) => {
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
            const currentUser = yield entities_1.User.findOne({ id: user.userId });
            return currentUser;
        });
    }
    deleteUsers({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return false;
            }
            yield entities_1.User.delete({});
            return true;
        });
    }
    meWithCommunities({ req }) {
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
                return null;
            }
            const connection = typeorm_1.getConnection();
            const userRepository = connection.getRepository(entities_1.User);
            const user = yield userRepository.findOne({
                where: { id: userId },
                relations: ["memberCommunities"],
            });
            return user;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [entities_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("username")),
    __param(1, type_graphql_1.Arg("email")),
    __param(2, type_graphql_1.Arg("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("usernameOrEmail")),
    __param(1, type_graphql_1.Arg("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Boolean)
], UserResolver.prototype, "logout", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("email")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("token")),
    __param(1, type_graphql_1.Arg("password")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "resetPassword", null);
__decorate([
    type_graphql_1.Query(() => entities_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUsers", null);
__decorate([
    type_graphql_1.Query(() => entities_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "meWithCommunities", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.default = UserResolver;
//# sourceMappingURL=user.js.map