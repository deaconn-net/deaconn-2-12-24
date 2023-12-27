import { type Prisma } from "@prisma/client";

export const ServiceFrontSelect = {
    id: true,
    banner: true,
    name: true,
    url: true,
    desc: true,
    totalDownloads: true,
    totalPurchases: true,
    totalViews: true
}

export type ServiceFooter = Prisma.ServiceGetPayload<{
    select: {
        id: true,
        name: true,
        url: true
    }
}>

export type ServiceWithCategoryAndLinks = Prisma.ServiceGetPayload<{
    include: {
        category: true,
        links: true
    }
}>