"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.isAuth = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new apollo_server_express_1.AuthenticationError(`User is not authenticated`);
    }
    return next();
};
//# sourceMappingURL=isAuth.js.map