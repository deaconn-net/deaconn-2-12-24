import { type UserPublicTeam } from "~/types/user/user";

import UserRowGrid from "@components/user/row/Grid";
import { SortByRole } from "@utils/user/Roles";

export default function OurTeamBlock({
    team
} : {
    team: UserPublicTeam[]
}) {
    // Sort team by role.
    const teamSorted = SortByRole(team);

    return (
        <>
            {teamSorted.length > 0 && (
                <div className="content-item2">
                    <div>
                        <h2>Our Team</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {teamSorted.map((user, index) => {
                            return (
                                <UserRowGrid
                                    key={`team-${index.toString()}`}
                                    user={user}
                                    showInline={true}
                                    avatarWidth={50}
                                    avatarHeight={50}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}