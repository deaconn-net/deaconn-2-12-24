import { type Prisma } from "@prisma/client";

export type UpdateLogWithUser = Prisma.UpdateLogGetPayload<{
    include: {
        user: true
    }
}>