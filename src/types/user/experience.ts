import { type Prisma } from "@prisma/client";

export type UserExperienceWithUser = Prisma.UserExperienceGetPayload<{
    include: {
        user: true
    }
}>