import Link from "next/link";

import { type UserSkill } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";

import ReactMarkdown from "react-markdown";

const Row: React.FC<{
    skill: UserSkill
}> = ({
    skill
}) => {
    const editUrl = "/user/profile/skills?id=" + skill.id.toString();

    const deleteMut = api.user.deleteSkill.useMutation();

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
                        <ReactMarkdown
                            className="markdown"
                        >
                            {skill.desc ?? ""}
                        </ReactMarkdown>
                    </div>
                    <div className="skill-row-actions">
                        <Link className="button button-primary" href={editUrl}>Edit</Link>
                        <Link className="button button-danger" href="#" onClick={(e) => {
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