import { UserRegisterInput } from "src/resolvers/user"
import { FieldError} from '../resolvers/user'

export const validateUserRegisterInput = (input: UserRegisterInput) => {
    const errors: FieldError[] = []
    if(!input.email.includes("@") ){
        errors.push({
            field: "email",
            message: "Please use a valid email address"
        })
        return errors
    }
    if(input.username.length < 4){
        errors.push({
            field: "username",
            message: "Please use a longer username"
        })
        return errors
    }

    if(input.password.length < 4){
        errors.push({
            field: "password",
            message: "Please use a longer password"
        })
        return errors
    }

    return errors
}