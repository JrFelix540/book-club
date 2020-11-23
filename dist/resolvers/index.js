"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = exports.PostResolver = exports.CommunityResolver = exports.UserCommentResolver = void 0;
var userComment_1 = require("./userComment");
Object.defineProperty(exports, "UserCommentResolver", { enumerable: true, get: function () { return __importDefault(userComment_1).default; } });
var community_1 = require("./community");
Object.defineProperty(exports, "CommunityResolver", { enumerable: true, get: function () { return __importDefault(community_1).default; } });
var post_1 = require("./post");
Object.defineProperty(exports, "PostResolver", { enumerable: true, get: function () { return __importDefault(post_1).default; } });
var user_1 = require("./user");
Object.defineProperty(exports, "UserResolver", { enumerable: true, get: function () { return __importDefault(user_1).default; } });
//# sourceMappingURL=index.js.map