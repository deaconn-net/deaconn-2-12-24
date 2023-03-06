import { User } from "@prisma/client";
import { UserLink } from "./link";

export const UserRow: React.FC<{ user: User }> = ({ user }) => {
    const avatar = (user.image) ? user.image : "/images/user/default.png";

    return (
        <div className="user-row">
            <img src={avatar} className="w-12 h-12" />
            <div className="text-white ml-2">
                <UserLink user={user} />
            </div>
            {user.title && (
                <div className="text-white font-bold ml-2">
                    {user.title}
                </div>
            )}
        </div>
    );
}