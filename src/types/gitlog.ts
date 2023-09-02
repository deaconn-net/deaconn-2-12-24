import { type Prisma } from "@prisma/client";
import { type UserPublicSelect } from "./user/user";

export type GitLogWithUser = Prisma.GitLogGetPayload<{
    include: {
        user: {
            select: typeof UserPublicSelect
        }
    }
}>