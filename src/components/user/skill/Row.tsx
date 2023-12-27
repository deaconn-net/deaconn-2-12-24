import { useContext } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserSkill } from "@prisma/client";

import { api } from "@utils/Api";
import { HasRole } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";

export default function SkillRow ({
    skill
} : {
    skill: UserSkill
}) {
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
        if (HasRole(session, "ADMIN") || HasRole(session, "MODERATOR"))
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
        <div className="content-item2">
            <div>
                <h2>{skill.title}</h2>
            </div>
            <div className="flex flex-col gap-4 h-full">
                <div className="pb-6 text-sm grow">
                    <p>{skill.desc ?? ""}</p>
                </div>
                <div className="p-6 flex flex-wrap gap-2 justify-center">
                    {canEdit && (
                        <>
                            <Link
                                href={editUrl}
                                className="button button-primary w-full"
                            >Edit</Link>
                            <button
                                className="button button-danger w-full"
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
        </div>
    );
}