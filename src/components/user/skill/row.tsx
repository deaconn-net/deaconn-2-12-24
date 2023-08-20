import Link from "next/link";
import { useSession } from "next-auth/react";

import { type UserSkill } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";
import { has_role } from "@utils/user/auth";

const UserSkillRow: React.FC<{
    skill: UserSkill
}> = ({
    skill
}) => {
    const { data: session } = useSession();
    const deleteMut = api.user.deleteSkill.useMutation();

    // Compile URLs.
    const editUrl = `/user/profile/skills?id=${skill.id.toString()}`;

    // See if we have permissions.
    let canEdit = false;

    if (session?.user) {
        const userId = session.user.id;

        // Is user owner?
        if (userId == skill.userId)
            canEdit = true;

        // Is user admin or moderator?
        if (has_role(session, "admin") || has_role(session, "moderator"))
            canEdit = true;
    }

    return (
        <>
            {deleteMut.isSuccess ? (
                <SuccessBox
                    title={"Successfully Deleted!"}
                    msg={"Successfully deleted skill ID #" + skill.id.toString() + "."}
                />
            ) : (
                <div className="skill-row">
                    <div className="skill-row-title">
                        <h3>{skill.title}</h3>
                    </div>
                    <div className="skill-row-description">
                        <p>{skill.desc ?? ""}</p>
                    </div>
                    <div className="skill-row-actions">
                        {canEdit && (
                            <>
                                <Link
                                    href={editUrl}
                                    className="button button-primary"
                                >Edit</Link>
                                <button
                                    className="button button-danger"
                                    onClick={(e) => {
                                        e.preventDefault();

                                        const yes = confirm("Are you sure you want to delete this experience?");

                                        if (yes) {
                                            deleteMut.mutate({
                                                id: skill.id
                                            });
                                        }
                                    }}
                                >Delete</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default UserSkillRow;