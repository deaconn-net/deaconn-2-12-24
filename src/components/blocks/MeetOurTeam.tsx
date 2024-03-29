import Markdown from "@components/markdown/Markdown";
import UserRowGrid from "@components/user/row/Grid";
import { SortByRole } from "@utils/user/Roles";
import { type UserPublicTeam } from "~/types/user/user";

export default function MeetOurTeamBlock ({
    team = []
} : {
    team?: UserPublicTeam[]
}) {
    // Sort team by role.
    const teamSorted = SortByRole(team);

    return (
        <>
            {teamSorted.length > 0 && (
                <div className="content-item2">
                    <div>
                        <h2>Meet Our Team!</h2>
                    </div>
                    <div>
                        {teamSorted.map((user, index) => {
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