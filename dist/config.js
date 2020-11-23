"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    databaseUrl: process.env.DATABASE_URL,
    corsOriginUrl: process.env.CORS_ORIGIN_URL,
    nodemailerEmail: process.env.NODE_MAILER_USER,
    nodemailerPassword: process.env.NODE_MAILER_PASSWORD,
    redisUrl: process.env.REDIS_URL,
};
//# sourceMappingURL=config.js.map