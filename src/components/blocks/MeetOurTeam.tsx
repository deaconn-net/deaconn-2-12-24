import { type UserPublic } from "~/types/user/user";

export default function MeetOurTeamBlock ({
    team
} : {
    team?: UserPublic[]
}) {
    return (
        <>
            {team && team.length > 0 && (
                <div className="content-item2">
                    <div>
                        <h2>Meet Our Team!</h2>
                    </div>
                    <div>
                        <p className="italic">Under construction...</p>
                    </div>
                </div>
            )}
        </>
    );
}