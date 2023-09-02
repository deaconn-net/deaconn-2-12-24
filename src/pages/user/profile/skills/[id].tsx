import { getServerAuthSession } from "@server/auth";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { UserPublicSelect } from "~/types/user/user";
import { type UserSkillWithUser } from "~/types/user/skill";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import UserSettingsPanel from "@components/user/SettingsPanel";
import SkillForm from "@components/forms/user/Skill";
import NotSignedIn from "@components/error/NotSignedIn";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    skill?: UserSkillWithUser
} & GlobalPropsType> = ({
    skill,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Editing Skill ${skill?.title ?? "N/A"} - My Skills - Deaconn`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {skill ? (
                        <UserSettingsPanel view="skills">
                            <div className="content-item2">
                                <div>
                                    <h2>Edit Skill {skill.title}</h2>
                                </div>
                                <div>
                                    <SkillForm skill={skill} />
                                </div>
                            </div>
                        </UserSettingsPanel>
                    ) : (
                        <NotSignedIn />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Retrieve skill ID.
    const { params } = ctx;

    const skillId = params?.id?.toString();
   
    // Initialize skill.
    let skill: UserSkillWithUser | null = null;

    // If signed in and skill ID is valid, retrieve skill.
    if (session?.user && skillId) {
        skill = await prisma.userSkill.findFirst({
            include: {
                user: {
                    select: UserPublicSelect
                }
            },
            where: {
                userId: session?.user?.id,
                id: Number(skillId)
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,

            skill: JSON.parse(JSON.stringify(skill))
        }
    };
}

export default Page;