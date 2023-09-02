import { type Prisma } from "@prisma/client";

import { type UserPublicSelect } from "./user";

export type UserProjectWithSources = Prisma.UserProjectGetPayload<{
    include: {
        sources: true
    }
}>

export type UserProjectWithUser = Prisma.UserProjectGetPayload<{
    include: {
        user: {
            select: typeof UserPublicSelect
        }
    }
}>

export type UserProjectWithSourcesAndUser = Prisma.UserProjectGetPayload<{
    include: {
        user: {
            select: typeof UserPublicSelect
        },
        sources: true
    }
}>