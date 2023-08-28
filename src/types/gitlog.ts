import { type Prisma } from "@prisma/client";

export type GitLogWithUser = Prisma.GitLogGetPayload<{
    include: {
        user: true
    }
}>