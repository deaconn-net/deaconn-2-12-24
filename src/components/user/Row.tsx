import Image from "next/image";

import { type UserPublicWithEmail, type UserPublic } from "~/types/user/user";
import { type User } from "@prisma/client";

export default function UserRow ({
    user
} : {
    user: User | UserPublic | UserPublicWithEmail 
}) {
    // Retrieve user avatar.
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    let avatar = process.env.NEXT_PUBLIC_DEFAULT_AVATAR_IMAGE || undefined;

    if (user.avatar)
        avatar = uploadUrl + user.avatar;

    // Compile links.
    const link = "/user/view/" + ((user.url) ? user.url : "$" + user.id);

    return (
        <a href={link} className="text-white bg-cyan-900 hover:bg-cyan-800 flex items-center gap-2 ring-4 ring-gray-800 hover:ring-gray-600">
            {avatar && (
                <Image
                    className="rounded-full w-16 h-16"
                    src={avatar}
                    width={50}
                    height={50}
                    alt="User Avatar"
                />
            )}
            <div className="text-white hover:text-white">
                {user.name}
            </div>
            {user.title && (
                <div className="font-bold">
                    {user.title}
                </div>
            )}
        </a>
    );
}