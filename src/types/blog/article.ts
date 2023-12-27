import { type Prisma } from "@prisma/client";

import { type UserPublicSelect, UserPublicSimpleSelect } from "../user/user";

export const ArticleFrontSelect = {
    id: true,
    banner: true,
    title: true,
    url: true,
    desc: true,
    views: true,
    comments: true,
    user: {
        select: UserPublicSimpleSelect
    }
}

export type ArticleWithUser = Prisma.ArticleGetPayload<{
    include: {
        user: {
            select: typeof UserPublicSelect
        }
    }
}>