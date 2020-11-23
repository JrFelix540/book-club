"use strict";
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
exports.createUpvoteLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const entities_1 = require("../entities/");
exports.createUpvoteLoader = () => new dataloader_1.default((keys) => __awaiter(void 0, void 0, void 0, function* () {
    const upvotes = yield entities_1.Upvote.findByIds(keys);
    const upvoteIdsToUpvotes = {};
    upvotes.forEach((upvote) => {
        upvoteIdsToUpvotes[`${upvote.creatorId}/${upvote.postId}`] = upvote;
    });
    return keys.map((key) => upvoteIdsToUpvotes[`${key.creatorId}/${key.postId}`]);
}));
//# sourceMappingURL=createUpvoteLoader.js.map