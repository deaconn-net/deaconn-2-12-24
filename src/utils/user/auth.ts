import { Session } from "next-auth";

export const has_role = (
    session: Session,
    role: string
) => {
    const roles = session.user?.roles;

    if (!roles)
        return false;
    
    return roles.includes(role);
}