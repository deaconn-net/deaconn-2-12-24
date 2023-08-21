import { getSession } from "next-auth/react";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type UserSkillWithUser } from "~/types/user/skill";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import UserSettingsPanel from "@components/user/settings_panel";
import SkillForm from "@components/forms/user/skill";
import NotSignedIn from "@components/errors/not_signed_in";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

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
                            <div className="content-item">
                                <h2>Edit Skill {skill.title}</h2>
                                <SkillForm skill={skill} />
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
    const session = await getSession(ctx);

    // Retrieve skill ID.
    const { params } = ctx;

    const skillId = params?.id?.toString();
   
    // Initialize skill.
    let skill: UserSkillWithUser | null = null;

    // If signed in and skill ID is valid, retrieve skill.
    if (session?.user && skillId) {
        skill = await prisma.userSkill.findFirst({
            include: {
                user: true
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