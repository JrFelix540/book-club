import { Collection, Entity, OneToMany, PrimaryKey, Property} from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Book } from "./Book";

@ObjectType()
@Entity()
export class Shelf {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    name!: string       

    @Field()
    @Property()
    type!: string

    @Field(() => [Book])
    @OneToMany(() => Book, book => book.shelf)
    books? = new Collection<Book>(this)

    @Field(() => String)
    @Property({type: "date"})
    createdAt = new Date();

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();


  

  

}