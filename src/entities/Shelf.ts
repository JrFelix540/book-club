import { Field, ObjectType } from "type-graphql";
import { Book } from "./Book";
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from "typeorm";

@ObjectType()
@Entity()
export class Shelf extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({unique: true})
    type!: string;

    @Field(() => [Book])
    @OneToMany(() => Book, book => book.shelf)
    books: Book[] 

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date
   

}



