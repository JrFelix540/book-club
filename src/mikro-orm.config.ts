import { MikroORM } from "@mikro-orm/core";
import path from 'path'
import { Author } from "./entities/Author";
import { Book } from "./entities/Book";
import { Genre } from "./entities/Genre";
import { Review } from "./entities/Review";
import { Shelf } from "./entities/Shelf";
import { User } from "./entities/User";

export default{
    entities: [Author, Book, Genre, Shelf, User, Review ],
    dbName: `bookclub`,
    password: `saleor`,
    user: `saleor`,
    debug: true,
    type: 'postgresql',
    migrations: {
        path: path.join(__dirname, './migrations/'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    } 
}  as Parameters<typeof MikroORM.init>[0]