import { Collection, Entity, ManyToMany, PrimaryKey, Property} from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Book } from "./Book";

@ObjectType()
@Entity()
export class Author {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    firstName!: string        

    @Field()
    @Property()
    lastName!: string;

    @Field(()=> [Book])
    @ManyToMany(() => Book, (book) => book.authors)
    books? = new Collection<Book>(this)

    @Field(() => String)
    @Property({type: "date"})
    createdAt = new Date();

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();

    



  

  

}