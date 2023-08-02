import { type User } from "@prisma/client";

export const isMod = (
    user: User
) => {
    return user.isTeam || user.isRoot;
}