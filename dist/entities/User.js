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
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const _1 = require("./");
let User = class User extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Community]),
    typeorm_1.OneToMany(() => _1.Community, (community) => community.creator, {
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Array)
], User.prototype, "createdCommunities", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Community]),
    typeorm_1.ManyToMany(() => _1.Community, (community) => community.members, {
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Array)
], User.prototype, "memberCommunities", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Review]),
    typeorm_1.OneToMany(() => _1.Review, (review) => review.creator, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "reviews", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Upvote]),
    typeorm_1.OneToMany(() => _1.Upvote, (upvote) => upvote.creator, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "upvotes", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.UserComment]),
    typeorm_1.OneToMany(() => _1.UserComment, (userComment) => userComment.creator, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Post]),
    typeorm_1.OneToMany(() => _1.Post, (post) => post.creator, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], User);
exports.default = User;
//# sourceMappingURL=User.js.map