import { type Prisma } from "@prisma/client";

import { type UserPublicSelect } from "./user/user";

export type UpdateLogWithUser = Prisma.UpdateLogGetPayload<{
    include: {
        user: {
            select: typeof UserPublicSelect
        }
    }
}>