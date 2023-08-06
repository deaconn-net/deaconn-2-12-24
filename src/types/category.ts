import { type Prisma } from "@prisma/client";

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
    include: {
        children: true
    }
}>;

export type CategoryWithParent = Prisma.CategoryGetPayload<{
    include: {
        parent: true
    }
}>;

export type CategoryWithAll = Prisma.CategoryGetPayload<{
    include: {
        parent: true,
        children: true
    }
}>;

export type CategoryWithAllAndAricleCount = Prisma.CategoryGetPayload<{
    include: {
        children: {
            include: {
                _count: {
                    select: {
                        Article: true
                    }
                }
            }
        },
        _count: {
            select: {
                Article: true
            }
        }
    }
}>;

export type CategoryWithAllAndServiceCount = Prisma.CategoryGetPayload<{
    include: {
        children: {
            include: {
                _count: {
                    select: {
                        Service: true
                    }
                }
            }
        },
        _count: {
            select: {
                Service: true
            }
        }
    }
}>;