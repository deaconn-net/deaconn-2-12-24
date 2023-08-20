import Image from "next/image";

import { type User } from "@prisma/client";

const UserRow: React.FC<{
    user: User
}> = ({
    user
}) => {
    const avatar = (user.image) ? user.image : "/images/user/default.png";

    const link = "/user/view/" + ((user.url) ? user.url : "$" + user.id);

    return (
        <a href={link} className="user-row">
            <Image
                className="user-row-image"
                src={avatar}
                width={50}
                height={50}
                alt="User Avatar"
            />
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

export default UserRow;