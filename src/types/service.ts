import { Prisma } from "@prisma/client";

export type ServiceFooter = Prisma.ServiceGetPayload<{
    select: {
        id: true,
        name: true,
        url: true
    }
}>