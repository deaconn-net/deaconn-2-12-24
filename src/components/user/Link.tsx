import Link from "next/link";

import { type User } from "@prisma/client";
import { type UserPublic, type UserPublicWithEmail } from "~/types/user/user";

export default function UserLink ({
    user,
    useLinkColor = true
} : {
    user: UserPublic | User | UserPublicWithEmail
    useLinkColor?: boolean
}) {
    const link = `/user/view/${user.url ? user.url : "$" + user.id}`;

    return (
        <Link
            href={link}
            className={useLinkColor ? "text-deaconn-link hover:text-deaconn-link2" : undefined}
        >
            <span>{user.name}</span>
        </Link>
    );
}