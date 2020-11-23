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
let Review = class Review extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Review.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Review.prototype, "content", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Review.prototype, "value", void 0);
__decorate([
    type_graphql_1.Field(() => _1.User),
    typeorm_1.ManyToOne(() => _1.User, (user) => user.reviews, {
        onDelete: "SET NULL",
    }),
    __metadata("design:type", _1.User)
], Review.prototype, "creator", void 0);
__decorate([
    type_graphql_1.Field(() => _1.Book),
    typeorm_1.ManyToOne(() => _1.Book, (book) => book.reviews, {
        onDelete: "SET NULL",
    }),
    __metadata("design:type", _1.Book)
], Review.prototype, "book", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Review.prototype, "updatedAt", void 0);
Review = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Review);
exports.default = Review;
//# sourceMappingURL=Review.js.map