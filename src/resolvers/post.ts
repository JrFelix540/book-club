import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, FieldResolver, Int, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { FieldError } from "./user";
import { Community } from "../entities/Community";
import { User } from "../entities/User";
import { Upvote } from "../entities/Upvote";


const allRelations = [ 'community', 'comments', 'upvotes']

@ObjectType()
export class PostResponse{
 
    @Field(()=> Post, { nullable: true })
    post?: Post

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[] 
}

@ObjectType()
export class UpvoteResponse{
    @Field(() => Upvote, { nullable: true })
    upvote?: Upvote
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    contentSnippet(
        @Root() post: Post
    ){
        return post.content.slice(0, 50)
    }

    @FieldResolver(() => User)
    creator(
        @Root() post: Post,
        @Ctx() {userLoader}: MyContext
    ){
        return userLoader.load(post.creatorId)
    }

    @FieldResolver(() => Community)
    community(
        @Root() post: Post,
        @Ctx() {communityLoader}: MyContext
    ){
        return communityLoader.load(post.communityId)
    }

    @FieldResolver(() => Boolean)
    async joinStatus(
        @Root() post: Post,
        @Ctx() { communityLoader, req }: MyContext
    ){
        const community = await communityLoader.load(post.communityId)
        const userId = req.session.userId 

        const found = community.memberIds.find(commId => commId === userId)

        if (found){
            return true
        } else{
            return false
        }

    }

    @FieldResolver(() => Int, {nullable: true })
    async hasVoted(
        @Root() post: Post,
        @Ctx() { req, upvoteLoader }: MyContext
    ){
        const userId = req.session.userId 
        const upvote = await upvoteLoader.load({postId: post.id, creatorId: userId })
        return upvote ? upvote.value : null
    }

    @Mutation(() => UpvoteResponse)
    async vote (
        @Ctx() {req}: MyContext,
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number
    ): Promise<UpvoteResponse>{
        // Check if the person has voted on the post
        const checkUpvote = await Upvote.findOne({ 
            where: { creatorId: req.session.userId,  
                postId: postId
            
            }})

        const post = await Post.findOne(postId)
        const user = await User.findOne(req.session.userId)

        if(!user){
            return{
                errors: [{
                    field: "user",
                    message: "The user does not exist"
                }]
            }
        }
        if(!post){
            return{
                errors: [{
                    field: "post",
                    message: "post does not exist"
                }]
            }
        }

        if (checkUpvote){
            if(checkUpvote.value !== value){
                checkUpvote.value = value
                try{
                    await checkUpvote.save()
                }catch(err){
                    console.log(err)
                }

                post.points = post.points + (2 * value)

                try{
                    await post.save()
                } catch(err){
                    console.log(err)
                }

            }

            return {
                errors: [{
                    field: "user",
                    message: "user has already voted"
                }]
            }
        }

        

        

        
        const upvote = new Upvote()
        upvote.postId = postId
        upvote.post = post
        upvote.creatorId = user.id
        upvote.creator = user
        upvote.value = value === 1 ? 1 : -1 

        try{
            await upvote.save()
        } catch(err){
            console.log(err)
        }

        post.points = post.points + value

        try{
            await post.save()
        } catch(err){
            console.log(err)
        }

        return{
            upvote
        }
        
    }

    @Mutation(() => Boolean)
    async deleteAllUpvote(): Promise<boolean>{
        await Upvote.delete({})
        return true
    }


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
        @Arg('communityId', () => Int) communityId: number,
        @Ctx() {req}: MyContext
    ): Promise<PostResponse>{
        if(!req.session.userId){
            throw Error("User not authenticated")
        }

        if(communityId === undefined){
            return{
                errors: [{
                    field: "communityId",
                    message: "Please select a community"
                }]
            }
        }

        const community = await Community.findOne({where: {id: communityId}})
        if(!community){
            return {
                errors: [{
                    field: "community",
                    message: "Community does not exist"

                }]
            }
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
        post.creatorId = user.id
        post.communityId = community.id

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

    @Mutation(() => Boolean)
    async deletePosts(
        
    ): Promise<Boolean>{
        await Post.delete({})
        return true
    }
}