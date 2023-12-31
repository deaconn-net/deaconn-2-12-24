import { UserRoles, type User } from "@prisma/client";
import { type UserPublicTeam } from "~/types/user/user";

const RolesOrder: Record<UserRoles, number> = {
    [UserRoles.ADMIN]: 1,
    [UserRoles.MODERATOR]: 2,
    [UserRoles.CONTRIBUTOR]: 3,
    [UserRoles.USER]: 4
}

const roleSort = (curRole: UserRoles, role: UserRoles) => {
    if (role == "ADMIN")
        return UserRoles.ADMIN;

    if (role == "MODERATOR" && curRole != "ADMIN")
        return UserRoles.MODERATOR;

    if (role == "CONTRIBUTOR" && curRole != "MODERATOR" && curRole != "ADMIN")
        return UserRoles.CONTRIBUTOR;

    return UserRoles.USER;
}

export function SortByRole(users: UserPublicTeam[] | User[]) {
    return users.sort((a, b) => {
        let aRole: UserRoles = UserRoles.USER;
        let bRole: UserRoles = UserRoles.USER;

        a.roles.map((role) => {
            aRole = roleSort(aRole, role);
        })

        b.roles.map((role) => {
            bRole = roleSort(bRole, role);
        })

        return RolesOrder[aRole] - RolesOrder[bRole];
    })
}