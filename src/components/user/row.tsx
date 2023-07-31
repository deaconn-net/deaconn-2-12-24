import { type User } from "@prisma/client";

const Row: React.FC<{
    user: User
}> = ({
    user
}) => {
    const avatar = (user.image) ? user.image : "/images/user/default.png";

    const link = "/user/view/" + ((user.url) ? user.url : "$" + user.id);

    return (
        <a href={link} className="user-row">
            <img src={avatar} className="w-12 h-12" />
            <div className="text-white ml-2">
                {user.name}
            </div>
            {user.title && (
                <div className="text-white font-bold ml-2">
                    {user.title}
                </div>
            )}
        </a>
    );
}

export default Row;