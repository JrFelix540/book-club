import { Field, Int, ObjectType } from "type-graphql";
import { Post } from "./Post";
import { User } from "./User";
import { BaseEntity, Entity, Column, ManyToOne, PrimaryColumn} from "typeorm";

@ObjectType()
@Entity()
export class Upvote extends BaseEntity{
    @Field(() => Int)
    @Column()
    value: number;

    @Field(() => Post)
    @ManyToOne(() => Post, post => post.upvotes, { onDelete: "CASCADE"})
    post: Post

    @Field(() => User)
    @ManyToOne(() => User, user => user.upvotes, { onDelete: "CASCADE"})
    creator: User

    @Field(() => Int)
    @PrimaryColumn()
    creatorId: number

    @Field(() => Int)
    @PrimaryColumn()
    postId: number

}

    