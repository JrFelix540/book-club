import { Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Book } from "./Book";

@ObjectType()
@Entity()
export class Genre {
  @Field()
  @PrimaryKey()
  id!: number;
  
  @Field()
  @Property()
  name!: string
  
  @Field(() => [Book])
  @ManyToMany(() => Book, (book) => book.genres)
  books? = new Collection<Book>(this)
  
  @Field(() => String)
  @Property()
  createdAt = new Date();
  
  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  

}