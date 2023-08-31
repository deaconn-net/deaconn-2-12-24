import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { type User } from "@prisma/client"

import { has_role } from "@utils/user/Auth";

export default function UserRowTable ({
    user
} : {
    user: User
}) {
    // Retrieve session.
    const { data: session } = useSession();

    // Retrieve user avatar.
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    let avatar = process.env.NEXT_PUBLIC_DEFAULT_AVATAR_IMAGE || undefined;

    if (user.avatar)
        avatar = uploadUrl + user.avatar;

    // Compile links.
    const editUrl = `/admin/user/edit/${user.id}`;

    return (
        <tr>
            <td className="user-browser-table-avatar">
                {avatar && (
                    <Image
                        src={avatar}
                        width={64}
                        height={64}
                        alt="Avatar"
                    />
                )}
            </td>
            <td className="user-browser-table-email">
                {user.email}
            </td>
            <td className="user-browser-table-name">
                {user.name && (
                    <>{user.name}</>
                )}
            </td>
            <td className="user-browser-table-url">
                {user.url && (
                    <>{user.url}</>
                )}
            </td>
            <td className="user-browser-table-title">
                {user.title && (
                    <>{user.title}</>
                )}
            </td>
            <td className="user-browser-table-actions">
                {session && has_role(session, "admin") && (
                    <Link
                        href={editUrl}
                        className="button button-primary"
                    >Edit</Link>
                )}
            </td>
        </tr>
    );
}