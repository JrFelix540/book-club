import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { MikroORM } from '@mikro-orm/core'
import mikroOrmConfig from './mikro-orm.config'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/user'



const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig)

    const app = express()

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({
            req,
            res,
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
