import { type Session } from "next-auth";

export const has_role = (
    session: Session | null,
    role: string
) => {
    if (!session)
        return false;
    
    const roles = session.user?.roles;

    if (!roles)
        return false;
    
    return roles.includes(role);
}