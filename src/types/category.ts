import { Prisma } from "@prisma/client";

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
    include: {
        children: true
    }
}>;