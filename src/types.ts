import { Request, Response } from "express";
import { EntityManager } from '@mikro-orm/core'

export type MyContext = {
    req: Request
    res: Response
    em: EntityManager
}