import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Book } from "./Book";
import { User } from "./User";

@ObjectType()
@Entity()
export class Review {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    name!: string

    @Field(() => User)
    @OneToOne(() => User)
    user!: User

    @Field()
    @Property({default: 0})
    value!: number

    @Field(() => Book)
    @ManyToOne(() => Book)
    book!: Book

    @Field(() => String)
    @Property({type: "date"})
    createdAt = new Date();

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();

  

}