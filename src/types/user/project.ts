import { type Prisma } from "@prisma/client";

export type UserProjectWithSources = Prisma.UserProjectGetPayload<{
    include: {
        sources: true
    }
}>

export type UserProjectWithUser = Prisma.UserProjectGetPayload<{
    include: {
        user: true
    }
}>

export type UserProjectWithSourcesAndUser = Prisma.UserProjectGetPayload<{
    include: {
        user: true,
        sources: true
    }
}>