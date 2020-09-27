import { User } from '../entities/User'
import { MyContext } from 'src/types'
import {Ctx, Query, Resolver} from 'type-graphql'

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello(){
        return `Hello, its me`
    }

    @Query(() => User)
    async users(
        @Ctx() {em}: MyContext
    ){
        const users = await em.find(User, {})
        return users
    }
}