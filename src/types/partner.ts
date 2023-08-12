import { Prisma } from "@prisma/client";

export type PartnerFooter = Prisma.PartnerGetPayload<{
    select: {
        id: true,
        banner: true,
        name: true,
        url: true
    }
}>