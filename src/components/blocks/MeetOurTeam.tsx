import Markdown from "@components/markdown/Markdown";
import UserLink from "@components/user/Link";
import Image from "next/image";
import { type UserPublic } from "~/types/user/user";

export default function MeetOurTeamBlock ({
    team = []
} : {
    team?: UserPublic[]
}) {
    const uploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    return (
        <>
            {team.length > 0 && (
                <div className="content-item2">
                    <div>
                        <h2>Meet Our Team!</h2>
                    </div>
                    <div>
                        {team.map((user, index) => {
                            let avatar = "/images/users/avatars/default.png";

                            if (user.avatar)
                                avatar = uploadsUrl + user.avatar;

                            return (
                                <div
                                    key={`user-${index.toString()}`}
                                    className="p-2"
                                >
                                    <div className="flex flex-wrap gap-2 items-center p-2">
                                        <Image
                                            src={avatar}
                                            width={64}
                                            height={64}
                                            className="rounded-full"
                                            alt="User Avatar"
                                        />
                                        <div className="flex flex-col gap-2">
                                            <UserLink user={user} />
                                            {user.title && (
                                                <span className="text-sm font-bold text-green-300">{user.title}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {user.aboutMe ? (
                                            <Markdown>
                                                {user.aboutMe}
                                            </Markdown>
                                        ) : (
                                            <p className="italic">No information provided...</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    );
}