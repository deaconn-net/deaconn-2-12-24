import { type Prisma } from "@prisma/client";

import { type UserPublicSelect } from "../user/user";

export type ArticleWithUser = Prisma.ArticleGetPayload<{
    include: {
        user: {
            select: typeof UserPublicSelect
        }
    }
}>