import { Prisma } from "@prisma/client";

export type RequestWithService = Prisma.RequestGetPayload<{
    include: {
        service: true
    }
}>;