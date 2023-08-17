import { type Prisma } from "@prisma/client";

export type RequestWithService = Prisma.RequestGetPayload<{
    include: {
        service: true
    }
}>

export type RequestWithAll = Prisma.RequestGetPayload<{
    include: {
        service: true,
        replies: {
            include: {
                user: true
            }
        },
        user: true
    }
}>