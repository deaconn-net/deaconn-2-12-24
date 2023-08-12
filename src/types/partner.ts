import { type Prisma } from "@prisma/client";

export type PartnerFooter = Prisma.PartnerGetPayload<{
    select: {
        id: true,
        name: true,
        url: true
    }
}>