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
var Book_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const _1 = require("./");
const type_graphql_1 = require("type-graphql");
let Book = Book_1 = class Book extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Book.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Book.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Author]),
    typeorm_1.ManyToMany(() => _1.Author, (author) => author.books, {
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Array)
], Book.prototype, "authors", void 0);
__decorate([
    type_graphql_1.Field(() => [Book_1]),
    typeorm_1.ManyToMany(() => _1.Genre, (genre) => genre.books, {
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Array)
], Book.prototype, "genres", void 0);
__decorate([
    type_graphql_1.Field(() => _1.Shelf),
    typeorm_1.ManyToOne(() => _1.Shelf, (shelf) => shelf.books, {
        onDelete: "SET NULL",
    }),
    __metadata("design:type", _1.Shelf)
], Book.prototype, "shelf", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Review]),
    typeorm_1.OneToMany(() => _1.Review, (review) => review.book, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], Book.prototype, "reviews", void 0);
__decorate([
    type_graphql_1.Field(() => [_1.Community]),
    typeorm_1.ManyToMany(() => _1.Community, (community) => community.favoriteBooks, { onDelete: "SET NULL" }),
    __metadata("design:type", Array)
], Book.prototype, "favoritedCommunities", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Book.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Book.prototype, "updatedAt", void 0);
Book = Book_1 = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Book);
exports.default = Book;
//# sourceMappingURL=Book.js.map