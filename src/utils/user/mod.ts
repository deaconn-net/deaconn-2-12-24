import { User } from "@prisma/client";

export const isMod = <T extends { user: User }> (user: T['user']) => {
    return user.isTeam || user.isRoot;
}