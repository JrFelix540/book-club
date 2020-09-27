import { User } from '../entities/User'
import { MyContext } from 'src/types'
import {Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver} from 'type-graphql'
import argon2 from 'argon2'
import { validateUserRegisterInput } from '../utils/validateUserInput'


@ObjectType()
export class FieldError{
    @Field()
    field: string

    @Field()
    message: string
}

@InputType()
export class UserRegisterInput{
    @Field()
    username: string

    @Field()
    email: string

    @Field()
    password: string

   
}

@InputType()
class UserLoginInput{
    @Field()
    usernameOrEmail: string
    
    @Field()
    password: string
}

@ObjectType()
class UserResponse{
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => User, {nullable: true})
    user?: User
}


@Resolver()
export class UserResolver {
    @Query(() => String)
    hello(){
        return `Hello, its me`
    }

    @Query(() => [User])
    async users(
        @Ctx() {em}: MyContext
    ): Promise<User[]>{
        
        const users = await em.find(User, {})
        console.log(users)
        return users
        
    }

    @Mutation(() => UserResponse)
    async register(
        @Ctx() {em}: MyContext,
        @Arg('userInput') userInput: UserRegisterInput
    ): Promise<UserResponse>{

        const errors = validateUserRegisterInput(userInput)
        if(errors.length > 0){
            return {
                errors
            }
        }


        const hashedPassword = await argon2.hash(userInput.password)
        const user = await em.create(User, {
            username: userInput.username,
            email: userInput.email,
            password: hashedPassword
            
        })
        
        const newEm = em.fork(false);
        await newEm.begin()

        try{
            newEm.persist(user)
            await newEm.commit()

        }catch(err){
            await newEm.rollback()
            if(err.detail.includes('already exists') && err.constraint === 'user_username_unique'){
                return {
                    errors: [{
                        field: "username",
                        message: "username already exists"
                    }]
                }
            }

            if(err.detail.includes('already exists') && err.constraint === 'user_email_unique'){
                return {
                    errors: [{
                        field: "email",
                        message: "A user of this email already exists"
                    }]
                }
            }

        }

        return{
            user
        }
        
        
    }

    @Mutation(() => UserResponse)
    async login(
        @Ctx() {em, req}: MyContext,
        @Arg('userInput') userInput: UserLoginInput
    ): Promise<UserResponse>
    {
        const searchBy = userInput.usernameOrEmail.includes("@") ? 'email' : 'username' 
        const user = searchBy === "email" ?
            await em.findOne(User, {email: userInput.usernameOrEmail}) :
            await em.findOne(User, {username: userInput.usernameOrEmail})


        if(!user){
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "The username or email does not exist"
                }]
            }
        }

        const verifyPassword = await argon2.verify(user.password, userInput.password)

        if(!verifyPassword){
            return {
                errors: [{
                    field: "password",
                    message: "Incorrect Password"
                }]
            }
        }

        req.session.userId = user.id

        return{
            user
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext,
    ): Promise<boolean>{

        return new Promise(
            resolve => req.session.destroy(
                err => {
                    res.clearCookie('qid')
                    if(err){
                        console.log(err)
                        resolve(false)
                    }

                    return resolve(true)

                }
            )
        )
    }
}