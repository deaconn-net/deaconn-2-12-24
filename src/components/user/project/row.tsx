import Link from "next/link";

import { type UserProject } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";

import ReactMarkdown from "react-markdown";

const Row: React.FC<{
    project: UserProject,
    small?: boolean
}> = ({
    project,
    small = false
}) => {
    const editUrl = "/user/profile/projects?id=" + project.id;

    const deleteMut = api.user.deleteProject.useMutation();

    return (
        <>
            {deleteMut.isSuccess ? (
                <SuccessBox
                    title={"Successfully Deleted!"}
                    msg={"Successfully deleted project ID #" + project.id + "."}
                />
            ) : (
                <div className={"project-row " + ((small) ? "project-row-sm" : "project-row-lg")}>
                    <div className="">
                        <h3 className="text-white text-2xl font-bold text-center">{project.name}</h3>
                    </div>
                    <div className="pb-6">
                        <ReactMarkdown
                            className="markdown"
                        >
                            {project.desc ?? ""}
                        </ReactMarkdown>
                    </div>
                    <div className="p-6 flex flex-wrap gap-2 justify-center">
                        <Link className="w-full button button-secondary" href={editUrl}>Edit</Link>
                        <Link className="w-full button button-delete" href="#" onClick={(e) => {
                            e.preventDefault();

                            const yes = confirm("Are you sure you want to delete this experience?");

                            if (yes) {
                                deleteMut.mutate({
                                    id: project.id
                                });
                            }
                        }}>Delete</Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default Row;