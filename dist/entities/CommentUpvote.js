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
const _1 = require(".");
let CommentUpvote = class CommentUpvote extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], CommentUpvote.prototype, "value", void 0);
__decorate([
    type_graphql_1.Field(() => _1.UserComment),
    typeorm_1.ManyToOne(() => _1.UserComment, (userComment) => userComment.commentUpvotes, { onDelete: "CASCADE" }),
    __metadata("design:type", _1.UserComment)
], CommentUpvote.prototype, "comment", void 0);
__decorate([
    type_graphql_1.Field(() => _1.User),
    typeorm_1.ManyToOne(() => _1.User, { onDelete: "CASCADE", nullable: true }),
    __metadata("design:type", _1.User)
], CommentUpvote.prototype, "creator", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], CommentUpvote.prototype, "commentId", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], CommentUpvote.prototype, "creatorId", void 0);
CommentUpvote = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], CommentUpvote);
exports.default = CommentUpvote;
//# sourceMappingURL=CommentUpvote.js.map