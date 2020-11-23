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
let Upvote = class Upvote extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Upvote.prototype, "value", void 0);
__decorate([
    type_graphql_1.Field(() => _1.Post),
    typeorm_1.ManyToOne(() => _1.Post, (post) => post.upvotes, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", _1.Post)
], Upvote.prototype, "post", void 0);
__decorate([
    type_graphql_1.Field(() => _1.User),
    typeorm_1.ManyToOne(() => _1.User, (user) => user.upvotes, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", _1.User)
], Upvote.prototype, "creator", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], Upvote.prototype, "creatorId", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], Upvote.prototype, "postId", void 0);
Upvote = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Upvote);
exports.default = Upvote;
//# sourceMappingURL=Upvote.js.map