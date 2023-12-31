import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { type User } from "@prisma/client"
import { type UserPublic, type UserPublicWithEmail } from "~/types/user/user";

import { HasRole } from "@utils/user/Auth";

export default function UserRowGrid ({
    user,
    showAvatar = true,
    showTitle = true,
    showEmail,
    showActions,
    showInline,
    avatarWidth = 72,
    avatarHeight = 72,
    nameAndTitleCenter = false
} : {
    user: User | UserPublic | UserPublicWithEmail
    showAvatar?: boolean
    showTitle?: boolean
    showEmail?: boolean
    showActions?: boolean
    showInline?: boolean
    avatarWidth?: number
    avatarHeight?: number
    nameAndTitleCenter?: boolean
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
    const viewUrl = `/user/view/${user.url ? user.url : `$${user.id.toString()}`}`

    return (
        <div className={`flex ${!showInline ? "flex-col" : "flex-wrap"} gap-2 items-center`}>
            <Link
                href={viewUrl}
                className={`flex ${!showInline ? "flex-col" : "flex-wrap"} gap-2 items-center`}
            >
                {showAvatar && avatar && (
                    <div>
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
                    <div className={`flex flex-col gap-1 ${nameAndTitleCenter ? "text-center" : ""}`}>
                        <span>{user.name}</span>
                        {showTitle && user.title && (
                            <span className="font-bold text-deaconn-link text-sm">{user.title}</span>
                        )}
                    </div>
                )}
            </Link>
            
            {showEmail && "email" in user && user.email && (
                <div className="">
                    {user.email}
                </div>
            )}
            {showActions && HasRole(session, "ADMIN") && (
                <div className="p-6 flex flex-wrap gap-2">
                    <Link
                        href={editUrl}
                        className="button button-primary w-full"
                    >Edit</Link>
                </div>
            )}
        </div>
    );
}