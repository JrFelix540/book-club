import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection, OneToMany } from "@mikro-orm/core";
import { Author } from "./Author";
import { Genre } from "./Genre"
import { Shelf } from "./Shelf";
import {Review} from './Review'
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Book {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    title!: string;

    @Field(() => [Author])
    @ManyToMany(() => Author, (author) => author.books, { owner: true }) 
    authors = new Collection<Author>(this);

    @Field(() => [Genre])
    @ManyToMany(() => Genre, (genre) => genre.books, { owner: true } ) 
    genres? = new Collection<Genre>(this);

    @Field(() => Shelf)
    @ManyToOne()
    shelf?: Shelf

    @Field(() => [Review])
    @OneToMany(() => Review, review => review.book)
    reviews? = new Collection<Review>(this)

    @Field(() => String)
    @Property({type: "date"})
    createdAt = new Date();

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();

  

}