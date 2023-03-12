import { User, UserRole } from "@prisma/client"

export const hasRole = (user: User & { userRoles: UserRole[] }, role: string) => {
    return user.userRoles.includes({
        userId: user.id,
        roleId: role
    });
}