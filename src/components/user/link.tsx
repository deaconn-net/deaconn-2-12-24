import Link from "next/link";

import { type User } from "@prisma/client";

export const UserLink: React.FC<{
    user: User
}> = ({
    user
}) => {
    const link = "/user/view/" + ((user.url) ? user.url : "$" + user.id);

    return (
        <Link href={link}>
            <span>{user.name}</span>
        </Link>
    );
}