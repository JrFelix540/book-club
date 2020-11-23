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
let Community = class Community extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Community.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], Community.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Community.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(() => _1.User),
    typeorm_1.ManyToOne(() => _1.User, (user) => user.createdCommunities, {
        onDelete: "SET NULL",
    }),
    __metadata("design:type", _1.User)
], Community.prototype, "creator", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Community.prototype, "creatorId", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Post]),
    typeorm_1.OneToMany(() => _1.Post, (post) => post.community, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], Community.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.User]),
    typeorm_1.ManyToMany(() => _1.User, (user) => user.memberCommunities, {
        onDelete: "CASCADE",
    }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Community.prototype, "members", void 0);
__decorate([
    type_graphql_1.Field(() => [type_graphql_1.Float]),
    typeorm_1.Column("int", { array: true, nullable: true }),
    __metadata("design:type", Array)
], Community.prototype, "memberIds", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Book]),
    typeorm_1.ManyToMany(() => _1.Book, (book) => book.favoritedCommunities, {
        onDelete: "SET NULL",
    }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Community.prototype, "favoriteBooks", void 0);
__decorate([
    type_graphql_1.Field(() => [type_graphql_1.Int]),
    typeorm_1.Column("int", { array: true, nullable: true }),
    __metadata("design:type", Array)
], Community.prototype, "favoriteBookIds", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Community.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Community.prototype, "updatedAt", void 0);
Community = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Community);
exports.default = Community;
//# sourceMappingURL=Community.js.map