import { useContext, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type UserProjectWithSourcesAndUser, type UserProjectWithUser } from "~/types/user/project";

import { api } from "@utils/api";
import { has_role } from "@utils/user/auth";

const UserProjectRow: React.FC<{
    project: UserProjectWithSourcesAndUser | UserProjectWithUser
}> = ({
    project
}) => {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve session.
    const { data: session } = useSession();

    // Retrieve user URL or ID for compiling URLs.
    const user = project.user;
    const userId = (user.url) ? user.url : `$${user.id.toString()}`;

    // Compile URLs.
    const viewUrl = `/user/view/${userId}/projects/${project.id.toString()}`;
    const editUrl = `/user/profile/projects/${project.id.toString()}`;

    // See if we have permissions.
    let canEdit = false;

    if (session?.user) {
        const userId = session.user.id;

        // Is user owner?
        if (userId == project.userId)
            canEdit = true;

        // Is user admin or moderator?
        if (has_role(session, "admin") || has_role(session, "moderator"))
            canEdit = true;
    }

    // Prepare mutations.
    const deleteMut = api.user.deleteProject.useMutation();

    useEffect(() => {
        if (deleteMut.isError && errorCtx) {
            console.error(deleteMut.error.message);
    
            errorCtx.setTitle("Failed To Delete Project");
            errorCtx.setMsg("Failed to delete project. Check your console for more details.");
        } else if (deleteMut.isSuccess && successCtx) {
            successCtx.setTitle("Successfully Deleted Project!");
            successCtx.setMsg("Successfully deleted project! Please reload the page.");
        }
    }, [deleteMut, errorCtx, successCtx])

    return (
        <div className="project-row">
            <div className="project-row-name">
                <h3>{project.name}</h3>
            </div>
            <div className="project-row-description">
                <p>{project.desc ?? ""}</p>
            </div>
            <div className="project-row-actions">
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
                                        id: project.id
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

export default UserProjectRow;