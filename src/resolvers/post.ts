import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { FieldError } from "./user";
import { Community } from "../entities/Community";
import { User } from "../entities/User";


const allRelations = ['creator', 'community', 'comments', 'upvotes']

@ObjectType()
export class PostResponse{
    @Field(()=> Post, { nullable: true })
    post?: Post

    @Field(() => FieldError, { nullable: true })
    errors?: FieldError[] 
}

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(
      
    ): Promise<Post[]>{

        const posts = await Post.find({relations: allRelations})
        return posts

    }

    @Query(() => Post)
    async post(
        @Arg('id') id: number
    ): Promise<Post>{
        const post = await Post.find({where: {id}, relations: allRelations})
        return post[0]
    }

    @Mutation(() => PostResponse)
    async createPost(
        @Arg('title') title: string,
        @Arg('content') content: string,
        @Arg('communityId') communityId: number,
        @Ctx() {req}: MyContext
    ): Promise<PostResponse>{
        
        const community = await Community.findOne({where: {id: communityId}})
        if(!community){
            return {
                errors: [{
                    field: "community",
                    message: "Community does not exist"

                }]
            }
        }

        if(!req.session.userId){
            throw Error("User not authenticated")
        }
        const user = await User.findOne({where: { id: req.session.userId }})

        if(!user){
            return {
                errors: [{
                    field: "user",
                    message: "User not found"
                }]
            }
        }

        const post = new Post()
        post.creator = user
        post.community = community
        post.title = title
        post.content = content

        try{
            await post.save()
        }catch(err){
            console.log(err)
        }

        return {
            post
        }

       

    }

    @Mutation(() => PostResponse)
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, {nullable: true}) title: string, 
        @Arg('content', () => String, { nullable: true}) content: string,
        @Ctx() {req}: MyContext
    ): Promise<PostResponse>{
        const post = await Post.findOne(id)
        if (!post){
            return {
                errors: [{
                    field: 'post',
                    message: "The post does not exits"
                }]
            }
        }
        if(post?.creator.id !== req.session.userId){
            return{
                errors: [{
                    field: "creator",
                    message: "User not authorized"
                }]
            }
        }

        if(title && post?.title){
            post.title = title
        }

        if(content && post?.content){
            post.content = content
        }

        try{
            await post.save()
        } catch(err){
            console.log(err)
        }

        return{
            post
        }
        
        
    }
}