import { User, UserRole } from "@prisma/client"

export const hasRole = <T extends { user: User & { userRoles: UserRole[] }, role: string }>(user: T['user'], role: T['role']) => {
    return user.userRoles.includes({
        userId: user.id,
        roleId: role
    });
}