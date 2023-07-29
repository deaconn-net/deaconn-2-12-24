import { Prisma } from "@prisma/client";

const requestWithService = Prisma.validator<Prisma.RequestArgs>()({
    include: {
        service: true
    }
});

export type RequestWithService = Prisma.RequestGetPayload<typeof requestWithService>;