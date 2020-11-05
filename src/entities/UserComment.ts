import { ObjectType, Field, Int } from "type-graphql";
import { Post, User } from "./";
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

@ObjectType()
@Entity()
export default class UserComment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  content!: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: "CASCADE",
  })
  creator!: User;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE",
  })
  post!: Post;

  @Field(() => [Int])
  @Column("int", { array: true, nullable: true })
  commentIds: number[];

  @Field()
  @Column({ default: 0 })
  points!: number;

  @Field(() => Int)
  @Column({ nullable: true })
  parentCommentId: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
