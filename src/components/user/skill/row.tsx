import { useContext } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserSkill } from "@prisma/client";

import { api } from "@utils/api";
import { has_role } from "@utils/user/auth";
import { ScrollToTop } from "@utils/scroll";

const UserSkillRow: React.FC<{
    skill: UserSkill
}> = ({
    skill
}) => {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve session.
    const { data: session } = useSession();

    // Compile URLs.
    const editUrl = `/user/profile/skills/${skill.id.toString()}`;

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

    // Prepare mutations.
    const deleteMut = api.user.deleteSkill.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Delete Skill");
                errorCtx.setMsg("Failed to delete skill. Check your console for more details.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Deleted Skill!");
                successCtx.setMsg("Successfully deleted skill! Please reload the page.");

                ScrollToTop();
            }
        }
    });

    return (
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
    );
}

export default UserSkillRow;