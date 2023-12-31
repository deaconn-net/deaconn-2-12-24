import Markdown from "@components/markdown/Markdown";
import UserLink from "@components/user/Link";
import UserRowGrid from "@components/user/row/Grid";
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
                                    <UserRowGrid
                                        user={user}
                                        showInline={true}
                                        avatarHeight={64}
                                        avatarWidth={64}
                                    />
                                    <div className="p-2">
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