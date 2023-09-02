import { type Prisma } from "@prisma/client";

import { type UserPublicSelect } from "./user";

export type UserSkillWithUser = Prisma.UserSkillGetPayload<{
    include: {
        user: {
            select: typeof UserPublicSelect
        }
    }
}>