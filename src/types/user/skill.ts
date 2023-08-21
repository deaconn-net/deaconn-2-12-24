import { type Prisma } from "@prisma/client";

export type UserSkillWithUser = Prisma.UserSkillGetPayload<{
    include: {
        user: true
    }
}>