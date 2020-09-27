import { Request, Response } from "express";
import { EntityManager } from '@mikro-orm/core'
import { Redis } from "ioredis";

export type MyContext = {
    req: Request & { session: Express.Session }
    res: Response
    em: EntityManager
    redis: Redis
}