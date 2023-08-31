import Image from "next/image";

import { type User } from "@prisma/client";

export default function UserRow ({
    user
} : {
    user: User
}) {
    // Retrieve user avatar.
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    let avatar = process.env.NEXT_PUBLIC_DEFAULT_AVATAR_IMAGE || undefined;

    if (user.avatar)
        avatar = uploadUrl + user.avatar;

    // Compile links.
    const link = "/user/view/" + ((user.url) ? user.url : "$" + user.id);

    return (
        <a href={link} className="user-row">
            {avatar && (
                <Image
                    className="user-row-image"
                    src={avatar}
                    width={50}
                    height={50}
                    alt="User Avatar"
                />
            )}
            <div className="user-row-username">
                {user.name}
            </div>
            {user.title && (
                <div className="user-row-title">
                    {user.title}
                </div>
            )}
        </a>
    );
}