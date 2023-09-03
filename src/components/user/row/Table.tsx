import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { type UserPublic, type UserPublicWithEmail } from "~/types/user/user";
import { type User } from "@prisma/client"

import { has_role } from "@utils/user/Auth";

export default function UserRowTable ({
    user,
    showAvatar = true,
    showTitle = true,
    showUrl,
    showEmail,
    showActions,
    avatarWidth = 72,
    avatarHeight = 72
} : {
    user: User | UserPublic | UserPublicWithEmail,
    showAvatar?: boolean,
    showTitle?: boolean,
    showUrl?: boolean,
    showEmail?: boolean,
    showActions?: boolean,
    avatarWidth?: number,
    avatarHeight?: number
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
            {showAvatar && (
                <td className="user-browser-table-avatar">
                    {avatar && (
                        <Image
                            src={avatar}
                            width={avatarWidth}
                            height={avatarHeight}
                            alt="Avatar"
                        />
                    )}
                </td>
            )}
            {showEmail && (
                <td className="user-browser-table-email">
                    {"email" in user && user.email && (
                        <>{user.email}</>
                    )}
                </td>
            )}
           
            <td className="user-browser-table-name">
                {user.name && (
                    <>{user.name}</>
                )}
            </td>
            {showUrl && (
                <td className="user-browser-table-url">
                    {user.url && (
                        <>{user.url}</>
                    )}
                </td>
            )}
            {showTitle && (
                <td className="user-browser-table-title">
                {user.title && (
                    <>{user.title}</>
                )}
                </td>
            )}

            {showActions && (
                <td className="user-browser-table-actions">
                    {session && has_role(session, "admin") && (
                        <Link
                            href={editUrl}
                            className="button button-primary"
                        >Edit</Link>
                    )}

                </td>
            )}
        </tr>
    );
}