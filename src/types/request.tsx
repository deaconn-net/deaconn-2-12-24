import { type Prisma } from "@prisma/client";

import { type UserPublicSelect } from "./user/user";

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
                user: {
                    select: typeof UserPublicSelect
                }
            }
        },
        user: {
            select: typeof UserPublicSelect
        }
    }
}>