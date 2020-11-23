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
const _1 = require("./");
const typeorm_1 = require("typeorm");
let UserComment = class UserComment extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], UserComment.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], UserComment.prototype, "content", void 0);
__decorate([
    type_graphql_1.Field(() => _1.User),
    typeorm_1.ManyToOne(() => _1.User, (user) => user.comments, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", _1.User)
], UserComment.prototype, "creator", void 0);
__decorate([
    type_graphql_1.Field(() => _1.Post),
    typeorm_1.ManyToOne(() => _1.Post, (post) => post.comments, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    __metadata("design:type", _1.Post)
], UserComment.prototype, "post", void 0);
__decorate([
    type_graphql_1.Field(() => [type_graphql_1.Int]),
    typeorm_1.Column("int", { array: true, nullable: true }),
    __metadata("design:type", Array)
], UserComment.prototype, "commentIds", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ default: 0 }),
    __metadata("design:type", Number)
], UserComment.prototype, "points", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], UserComment.prototype, "parentCommentId", void 0);
__decorate([
    type_graphql_1.Field(() => _1.CommentUpvote),
    typeorm_1.OneToMany(() => _1.CommentUpvote, (commentUpvote) => commentUpvote.comment, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], UserComment.prototype, "commentUpvotes", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], UserComment.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], UserComment.prototype, "updatedAt", void 0);
UserComment = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], UserComment);
exports.default = UserComment;
//# sourceMappingURL=UserComment.js.map