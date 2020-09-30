import { Field, ObjectType } from "type-graphql";
import { Community } from "./Community";
import { Upvote } from "./Upvote";
import { User } from "./User";
import { UserComment } from './UserComment'

import {BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column()
    title!: string
    
    @Field()
    @Column()
    content!: string

    @Field(() => User)
    @ManyToOne(() => User, user => user.posts)
    creator!: User

    @Field(() => Community)
    @ManyToOne(() => Community, community => community.posts)
    community!: Community

    @Field(() => [UserComment])
    @OneToMany(() => UserComment, userComment => userComment.post)
    comments: UserComment[]

    @Field(() => [Upvote])
    @OneToMany(() => Upvote, upvote => upvote.post)
    upvotes: Upvote[]

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date

}

