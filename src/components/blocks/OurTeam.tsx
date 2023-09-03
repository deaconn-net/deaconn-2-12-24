import { type UserPublic } from "~/types/user/user";

import UserRowGrid from "@components/user/row/Grid";

export default function OurTeamBlock({
    team
} : {
    team: UserPublic[]
}) {
    return (
        <>
            {team.length > 0 && (
                <div className="content-item2">
                    <div>
                        <h2>Our Team</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {team.map((user) => {
                            return (
                                <UserRowGrid
                                    key={"team-" + user.id}
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