import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { type User } from "@prisma/client"

import { has_role } from "@utils/user/auth";

const UserGridRow: React.FC<{
    user: User
}> = ({
    user
}) => {
    const { data: session } = useSession();

    // Compile links.
    const editUrl = `/admin/user/edit/${user.id}`;

    return (
        <div className="flex flex-col gap-2">
            <div className="user-browser-grid-avatar">
                {user.image && (
                    <Image
                        src={user.image}
                        width={32}
                        height={32}
                        alt="Avatar"
                    />
                )}
            </div>
            {user.name && (
                <div className="user-browser-grid-name">
                    <h3>{user.name}</h3>
                </div>
            )}
            <div className="user-browser-grid-email">
                {user.email}
            </div>
            <div className="user-browser-grid-main">
                {user.url && (
                    <>{user.url}</>
                )}
                {user.title && (
                    <>{user.title}</>
                )}
            </div>
            {session && has_role(session, "admin") && (
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

export default UserGridRow;