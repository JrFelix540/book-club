import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, OneToMany, BaseEntity } from "typeorm";
import { Author } from "./Author";
import { Genre } from "./Genre"
import { Shelf } from "./Shelf";
import {Review} from './Review'
import { Field, ObjectType } from "type-graphql";
import { Community } from "./Community";


@ObjectType()
@Entity()
export class Book  extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field(() => [Author])
    @ManyToMany(() => Author, author => author.books)
    authors!: Author[]

    @Field(() => [Book])
    @ManyToMany(() => Genre, genre => genre.books)
    genres: Genre[]

    @Field(() => Shelf)
    @ManyToOne(() => Shelf, shelf => shelf.books)
    shelf: Shelf

    @Field(() => [Review])
    @OneToMany(() => Review, review => review.book)
    reviews: Review[]

    @Field(() => [Community])
    @ManyToMany(() => Community, community => community.favoriteBooks)
    favoritedCommunities: Community[]

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date

}







