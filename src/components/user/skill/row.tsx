import { UserSkill } from "@prisma/client";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { api } from "~/utils/api";
import { SuccessBox } from "../../utils/success";

export const SkillRow: React.FC<{ skill: UserSkill, small?: boolean }> = ({ skill, small=false }) => {
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
            <div className="">
              <h3 className="text-white text-2xl font-bold text-center">{skill.title}</h3>
            </div>
            <div className="pb-6">
                <ReactMarkdown
                    className="markdown"
                >
                    {skill.desc ?? ""}
                </ReactMarkdown>
            </div>
            <div className="p-6 flex flex-wrap gap-2 justify-center">
                <Link className="w-full button button-secondary" href={editUrl}>Edit</Link>
                <Link className="w-full button button-delete" href="#" onClick={(e) => {
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