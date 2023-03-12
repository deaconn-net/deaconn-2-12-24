import { Service, UserExperience } from "@prisma/client";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { api } from "~/utils/api";
import { SuccessBox } from "../../utils/success";

export const ExperienceRow: React.FC<{ experience: UserExperience, small?: boolean }> = ({ experience, small = false }) => {
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
                    <div className="">
                        <h3 className="text-white text-2xl font-bold text-center">{experience.title}</h3>
                    </div>
                    <div className="pb-6">
                        <ReactMarkdown
                            className="markdown"
                        >
                            {experience.desc ?? ""}
                        </ReactMarkdown>
                    </div>
                    <div className="p-6 flex flex-wrap gap-2 justify-center">
                        <Link className="w-full button button-secondary" href={editUrl}>Edit</Link>
                        <Link className="w-full button button-delete" href="#" onClick={(e) => {
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