import { useContext } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserExperienceWithUser } from "~/types/user/experience";

import { api } from "@utils/Api";
import { has_role } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";

export default function UserExperienceRow ({
    experience
} : {
    experience: UserExperienceWithUser
}) {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve session.
    const { data: session } = useSession();

    // Retrieve user URL or ID for compiling URLs.
    const user = experience.user;
    const userId = (user.url) ? user.url : `$${user.id.toString()}`;

    // Compile URLs.
    const viewUrl = `/user/view/${userId}/experiences/${experience.id.toString()}`;
    const editUrl = `/user/profile/experiences/${experience.id.toString()}`;

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

    // Prepare mutations.
    const deleteMut = api.user.deleteExperience.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Delete Experience");
                errorCtx.setMsg("Failed to delete experience. Please check your console for more details.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Deleted Experience!");
                successCtx.setMsg("Successfully deleted experience! Please reload the page.");

                ScrollToTop();
            }
        }
    });

    return (
        <div className="content-item2">
            <div>
                <h2>{experience.title}{experience.company ? ` @ ${experience.company}` : ``}</h2>
            </div>
            <div className="flex flex-col gap-4 h-full">
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
        </div>
    );
}