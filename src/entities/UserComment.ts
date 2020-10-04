import { ObjectType, Field } from "type-graphql";
import { Post } from "./Post";
import { User } from "./User";

import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";

@ObjectType()
@Entity()
export class UserComment extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    content!: string;

    @Field(() => User)
    @ManyToOne(() => User, user => user.comments, { onDelete: "SET NULL" })
    creator!: User

    @Field(() => Post)
    @ManyToOne(() => Post, post => post.comments, { onDelete: "SET NULL"})
    post!: Post

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date
}

