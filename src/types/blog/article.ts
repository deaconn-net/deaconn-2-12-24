import { type Prisma } from "@prisma/client";

export type ArticleWithUser = Prisma.ArticleGetPayload<{
    include: {
        user: true
    }
}>