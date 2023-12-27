import { type UserRoles } from "@prisma/client";
import { type Session } from "next-auth";

export function HasRole(session: Session | null, role: UserRoles) {
    if (!session?.user)
        return false;
    
    const roles = session.user.roles;

    if (!roles)
        return false;
    
    return roles.includes(role);
}