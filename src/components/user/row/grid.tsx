import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { type User } from "@prisma/client"

import { has_role } from "@utils/user/auth";
import UserLink from "../link";

export default function UserRowGrid ({
    user,
    showBanner = true,
    showTitle = true,
    showEmail,
    showActions
} : {
    user: User,
    showBanner?: boolean,
    showTitle?: boolean,
    showEmail?: boolean,
    showActions?: boolean
}) {
    const { data: session } = useSession();

    // Compile links.
    const editUrl = `/admin/user/edit/${user.id}`;

    return (
        <div className="flex flex-col gap-2 items-center">
            {showBanner && user.image && (
                <div className="user-browser-grid-avatar">
                    <Image
                        className="rounded-full"
                        src={user.image}
                        width={72}
                        height={72}
                        alt="Avatar"
                    />
                </div>
            )}
            {user.name && (
                <div className="user-browser-grid-name">
                    <h3>
                        <UserLink
                            user={user}
                        />
                    </h3>
                </div>
            )}
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