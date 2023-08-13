import { type Prisma } from "@prisma/client";

export type UserProjectWithSources = Prisma.UserProjectGetPayload<{
    include: {
        sources: true
    }
}>