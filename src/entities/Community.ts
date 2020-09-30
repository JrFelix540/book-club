import { Field, ObjectType } from "type-graphql";
import { Book } from "./Book";
import { Post } from "./Post";
import { User } from "./User";
import {BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm";

@ObjectType()
@Entity()
export class Community extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    name!: string;

    @Field(() => User)
    @ManyToOne(() => User, user => user.createdCommunities)
    creator!: User
    
    @Field(() => [Post])
    @OneToMany(() => Post, post => post.community)
    posts: Post[]

    @Field(() => [User])
    @ManyToMany(() => User, user => user.memberCommunities)
    @JoinTable()
    members: User[];

    @Field(() => [Book])
    @ManyToMany(() => Book, book => book.favoritedCommunities)
    @JoinTable()
    favoriteBooks: Book[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

}

