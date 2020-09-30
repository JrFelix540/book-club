import { Field, ObjectType } from "type-graphql";
import { Post } from "./Post";
import { User } from "./User";
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";

@ObjectType()
@Entity()
export class Upvote extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    value: number;

    @Field(() => Post)
    @ManyToOne(() => Post, post => post.upvotes)
    post: Post

    @Field(() => User)
    @ManyToOne(() => User, user => user.upvotes)
    creator: User

}

    