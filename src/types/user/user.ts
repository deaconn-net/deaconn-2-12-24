import { type Prisma } from "@prisma/client";

export const UserPublicSelect = {
    id: true,
    avatar: true,
    url: true,
    name: true,
    title: true,
    aboutMe: true,
    birthday: true,
    isTeam: true,
    showEmail: true,
    
    website: true,
    socialTwitter: true,
    socialGithub: true,
    socialLinkedin: true,
    socialFacebook: true
}

export const UserPublicSelectWithEmail = {
    ...UserPublicSelect,
    email: true
}

export const UserPublicRefSelect = {
    id: true,
    url: true
};

export type UserPublic = Prisma.UserGetPayload<{
    select: typeof UserPublicSelect
}>

export type UserPublicWithEmail = Prisma.UserGetPayload<{
    select: typeof UserPublicSelectWithEmail
}>

export type UserPublicRef = Prisma.UserGetPayload<{
    select: typeof UserPublicRefSelect
}>