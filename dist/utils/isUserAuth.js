"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserAuth = void 0;
exports.isUserAuth = (userId) => {
    if (!userId) {
        return {
            error: [
                {
                    field: "User",
                    message: "User not authenticated",
                },
            ],
        };
    }
    return;
};
//# sourceMappingURL=isUserAuth.js.map