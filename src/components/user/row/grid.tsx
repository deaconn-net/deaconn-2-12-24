import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { type User } from "@prisma/client"

import { has_role } from "@utils/user/auth";
import UserLink from "../link";

export default function UserRowGrid ({
    user,
    showAvatar = true,
    showTitle = true,
    showEmail,
    showActions,
    showInline,
    avatarWidth = 72,
    avatarHeight = 72
} : {
    user: User,
    showAvatar?: boolean,
    showTitle?: boolean,
    showEmail?: boolean,
    showActions?: boolean,
    showInline?: boolean,
    avatarWidth?: number,
    avatarHeight?: number
}) {
    const { data: session } = useSession();

    // Compile links.
    const editUrl = `/admin/user/edit/${user.id}`;
    const viewUrl = `/user/view/${user.url ? user.url : `$${user.id.toString()}`}`

    // Retrieve some environmental variables.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    let avatar = cdn + (process.env.NEXT_PUBLIC_DEFAULT_AVATAR_IMAGE ?? "");

    if (user.avatar)
        avatar = cdn + uploadUrl + user.avatar;

    return (
        <div className={`flex ${!showInline ? "flex-col" : "flex-wrap"} gap-2 items-center`}>
            <Link
                href={viewUrl}
                className={`flex ${!showInline ? "flex-col" : "flex-wrap"} gap-2 items-center`}
            >
                {showAvatar && (
                    <div className="user-browser-grid-avatar">
                        <Image
                            className="rounded-full"
                            src={avatar}
                            width={avatarWidth}
                            height={avatarHeight}
                            alt="Avatar"
                        />
                    </div>
                )}
                {user.name && (
                    <div className="user-browser-grid-name">
                        {user.name}
                    </div>
                )}
            </Link>
            {showTitle && user.title && (
                <div className="user-browser-title">
                    <p>{user.title}</p>
                </div>
            )}
            {showEmail && (
                <div className="user-browser-grid-email">
                    {user.email}
                </div>
            )}
            {showActions && session && has_role(session, "admin") && (
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={editUrl}
                        className="button button-primary"
                    >Edit</Link>
                </div>
            )}
        </div>
    );
}