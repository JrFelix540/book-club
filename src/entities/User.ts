import { Entity, OneToOne, PrimaryKey, Property} from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Review } from "./Review";

@ObjectType()
@Entity()
export class User {
    @Field()
    @PrimaryKey()
    id!: number;

    @Property()
    password: string        

    @Field()
    @Property({unique: true})
    username!: string;

    @Field()
    @Property({ unique: true })
    email!: string

    @Field(() => String)
    @Property()
    createdAt = new Date();

    @Field(() => String)
    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field(() => Review)
    @OneToOne(() => Review)
    review?: Review

    

  

  

}