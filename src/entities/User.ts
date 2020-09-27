import { Entity, PrimaryKey, Property} from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

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
    @Property({type: "date"})
    createdAt = new Date();

    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: "date" })
    updatedAt = new Date();

   

    

  

  

}