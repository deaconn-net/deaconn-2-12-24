import { type Prisma } from "@prisma/client";

import { type UserPublicSelect } from "./user";

export type UserExperienceWithUser = Prisma.UserExperienceGetPayload<{
    include: {
        user: {
            select: typeof UserPublicSelect
        }
    }
}>