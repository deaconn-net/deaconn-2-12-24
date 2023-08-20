import Link from "next/link";
import { useSession } from "next-auth/react";

import { type UserExperience } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";
import { has_role } from "@utils/user/auth";

const UserExperienceRow: React.FC<{
    experience: UserExperience
}> = ({
    experience
}) => {
    const { data: session } = useSession();
    const deleteMut = api.user.deleteExperience.useMutation();

    // Compile URLs.
    const viewUrl = `/user/view/$${experience.userId}/experiences/${experience.id.toString()}`;
    const editUrl = `/user/profile/experiences?id=${experience.id.toString()}`;

    // See if we have permissions.
    let canEdit = false;

    if (session?.user) {
        const userId = session.user.id;

        // Is user owner?
        if (userId == experience.userId)
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
                    msg={"Successfully deleted experience ID #" + experience.id.toString() + "."}
                />
            ) : (
                <div className={"experience-row"}>
                    <div className="experience-row-title">
                        <h3>{experience.title}</h3>
                    </div>
                    <div className="experience-row-description">
                        <p>{experience.desc ?? ""}</p>
                    </div>

                    <div className="experience-row-actions">
                        <Link
                            href={viewUrl}
                            className="button"
                        >View</Link>
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
                                                id: experience.id
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

export default UserExperienceRow;