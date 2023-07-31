import Link from "next/link";

import { type UserSkill } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";

import ReactMarkdown from "react-markdown";

const Row: React.FC<{
    skill: UserSkill,
    small?: boolean
}> = ({
    skill,
    small = false
}) => {
    const editUrl = "/user/profile/skills?id=" + skill.id;

    const deleteMut = api.user.deleteSkill.useMutation();

    return (
        <>
            {deleteMut.isSuccess ? (
                <SuccessBox
                    title={"Successfully Deleted!"}
                    msg={"Successfully deleted skill ID #" + skill.id + "."}
                />
            ) : (
                <div className={"skill-row " + ((small) ? "skill-row-sm" : "skill-row-lg")}>
                    <div className="skill-row-title">
                        <h3>{skill.title}</h3>
                    </div>
                    <div className="skill-row-description">
                        <ReactMarkdown
                            className="markdown"
                        >
                            {skill.desc ?? ""}
                        </ReactMarkdown>
                    </div>
                    <div className="skill-row-actions">
                        <Link className="button button-secondary" href={editUrl}>Edit</Link>
                        <Link className="button button-delete" href="#" onClick={(e) => {
                            e.preventDefault();

                            const yes = confirm("Are you sure you want to delete this experience?");

                            if (yes) {
                                deleteMut.mutate({
                                    id: skill.id
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