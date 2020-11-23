"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRegisterInput = void 0;
exports.validateUserRegisterInput = (input) => {
    const errors = [];
    if (!input.email.includes("@")) {
        errors.push({
            field: "email",
            message: "Please use a valid email address"
        });
        return errors;
    }
    if (input.username.length < 4) {
        errors.push({
            field: "username",
            message: "Please use a longer username"
        });
        return errors;
    }
    if (input.password.length < 4) {
        errors.push({
            field: "password",
            message: "Please use a longer password"
        });
        return errors;
    }
    return errors;
};
//# sourceMappingURL=validateUserInput.js.map