import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Community } from '../entities/Community'
import { FieldError } from "./user"
import { getConnection, Repository } from 'typeorm'


const allRelations: string[] = ["creator", "posts", "members", "favoriteBooks"]


@ObjectType()
export class CommunityResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => Community, {nullable: true})
    community?: Community
}

@ObjectType()
export class BooleanFieldResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => Boolean, { nullable: true })
    ok?: boolean
}

@Resolver()
export class CommunityResolver{
    @Query(() => [Community])
    async allCommunities (
    ){

    const connection = getConnection()
    const communityRepository: Repository<Community> = connection.getRepository(Community)
        const communities = await communityRepository.find({relations: allRelations})
        return communities
    }

    @Query(() => Community)
    async community(
        @Arg('id') id: number
    ) {

        const connection = getConnection()
        const communityRepository: Repository<Community> = connection.getRepository(Community)
        const community = await communityRepository.find({
            where: {id},
            relations: allRelations
        })

        return community[0]


        
        
    }

    @Mutation(() => CommunityResponse)
    async createCommunity(
        @Ctx() { req}: MyContext,
        @Arg('title') title: string 
    ): Promise<CommunityResponse>{

        const user = await User.findOne({where: { id: req.session.userId }} )

        const connection = getConnection()
        if(!user){
            throw Error(`User is not authenticated`)
        }

       const community = new Community()
       community.name = title
       community.creator = user
       community.members = [user]


       

        try{
           await connection.manager.save(community)
           
        } catch (err){
            console.log(err)
            return{
                errors: [{
                    field: 'name',
                    message: 'Another group of the same name exists !'
                }]
            }
        }
        
        return {
            community
        }
    }

    @Mutation(() => BooleanFieldResponse)
    async joinCommunity(
        @Ctx() { req }: MyContext,
        @Arg('id', () => Int) id: number

    ): Promise<BooleanFieldResponse> {
        const {userId} = req.session
        const user = await User.findOne({where: {id: userId}})
        if(!user){
            throw Error("The user is not authenticated")
        }
        const community = await Community.findOne( {id}, {relations: ['members']})
        if(!community){
            return{
                errors: [{
                    field: "community",
                    message: "error in fetching community"
                }]
            }
        }

        community.members = [...community.members, user]

        console.log(community.members)

        try{
           await community.save()

        } catch(err) {
            console.log(err)

            if (err.detail.includes('already exists')){
                return {
                    errors: [{
                        field: 'community',
                        message:  `You've already joined this community`
                    }]
                }
            }
            
        }
        

        return{
            ok: true
        }
    }

    @Mutation(() => Boolean)
    async deleteAllCommunities(
    ){
        await Community.delete({})

        return true
    }
}