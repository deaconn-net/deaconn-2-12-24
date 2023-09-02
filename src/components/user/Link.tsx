import Link from "next/link";

import { type User } from "@prisma/client";
import { type UserPublic, type UserPublicWithEmail } from "~/types/user/user";

export default function UserLink ({
    user
} : {
    user: UserPublic | User | UserPublicWithEmail
}) {
    const link = `/user/view/${user.url ? user.url : "$" + user.id}`;

    return (
        <Link href={link}>
            <span>{user.name}</span>
        </Link>
    );
}