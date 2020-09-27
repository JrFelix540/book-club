import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { MikroORM } from '@mikro-orm/core'
import mikroOrmConfig from './mikro-orm.config'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/user'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig)

    const app = express()

    const redis = new Redis()
    const RedisStore = connectRedis(session)

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                sameSite: "lax",
                secure: false
            },
            saveUninitialized: false,
            secret: 'route540',
            resave: false,
        })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({
            req,
            res,
            redis,
            em: orm.em
        })

    })

    apolloServer.applyMiddleware({ 
        app, 
        cors: false,
    })

    app.listen(4040, () => {
        console.log(`Server running at port 4040`)
    })
    

}

main().catch(err => console.log(err))
