import Link from "next/link";

import { type Service, type UserExperience } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";

import ReactMarkdown from "react-markdown";

const Row: React.FC<{
    experience: UserExperience,
    small?: boolean
}> = ({
    experience,
    small = false
}) => {
    const editUrl = "/user/profile/experiences?id=" + experience.id;

    const deleteMut = api.user.deleteExperience.useMutation();

    return (
        <>
            {deleteMut.isSuccess ? (
                <SuccessBox
                    title={"Successfully Deleted!"}
                    msg={"Successfully deleted experience ID #" + experience.id + "."}
                />
            ) : (
                <div className={"experience-row " + ((small) ? "experience-row-sm" : "experience-row-lg")}>
                    <div className="experience-row-title">
                        <h3>{experience.title}</h3>
                    </div>
                    <div className="experience-row-description">
                        <ReactMarkdown
                            className="markdown"
                        >
                            {experience.desc ?? ""}
                        </ReactMarkdown>
                    </div>
                    <div className="experience-row-actions">
                        <Link className="button button-primary" href={editUrl}>Edit</Link>
                        <Link className="button button-delete" href="#" onClick={(e) => {
                            e.preventDefault();

                            const yes = confirm("Are you sure you want to delete this experience?");

                            if (yes) {
                                deleteMut.mutate({
                                    id: experience.id
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