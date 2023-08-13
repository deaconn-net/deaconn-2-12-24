import { getSession } from "next-auth/react";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type User, type UserExperience, type UserProject, type UserSkill } from "@prisma/client";
import { type UserProjectWithSources } from "~/types/user/project";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import UserSettingsPanel from "@components/forms/user/settings_panel";
import NoPermissions from "@components/errors/no_permissions";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    authed: boolean,
    view: string,

    user?: User,
    experience?: UserExperience,
    project?: UserProjectWithSources,
    skill?: UserSkill
} & GlobalPropsType> = ({
    authed,
    view,

    user,
    experience,
    project,
    skill,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`${view.charAt(0).toUpperCase() + view.slice(1)} Profile - Deaconn`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {authed ? (
                    <div className="content-item"> 
                        <UserSettingsPanel
                            view={view}

                            user={user}
                            experience={experience}
                            project={project}
                            skill={skill}
                        />
                    </div>
                ) : (
                    <NoPermissions />
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Make sure we're signed in and authenticated.
    let authed = true;
    const session = await getSession(ctx);

    if (!session || !session.user)
        authed = false;

    // Retrieve view and ID if any.
    const { query, params } = ctx;
    let view = params?.view?.[0];

    if (!view || !["general", "experiences", "skills", "projects"].includes(view))
        view = "general";

    const lookup_id = query?.id;

    let user: User | null = null;
    let experience: UserExperience | null = null;
    let skill: UserSkill | null = null;
    let project: UserProjectWithSources | null = null;

    if (authed) {
        if (lookup_id) {
            const id = Number(lookup_id.toString());

            if (view == "experiences") {
                experience = await prisma.userExperience.findFirst({
                    where: {
                        userId: session?.user?.id,
                        id: id
                    }
                })
            } else if (view == "skills") {
                skill = await prisma.userSkill.findFirst({
                    where: {
                        userId: session?.user?.id,
                        id: id
                    }
                });
            } else if (view == "projects") {
                project = await prisma.userProject.findFirst({
                    where: {
                        userId: session?.user?.id,
                        id: id
                    },
                    include: {
                        sources: true
                    }
                });
            }
        } else if (view == "general") {
            // Retrieve user if we're on general form.
            user = await prisma.user.findFirst({
                where: {
                    id: session?.user?.id
                }
            })
        }
    }

    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            authed: authed,
            view: view,

            user: JSON.parse(JSON.stringify(user)),
            experience: JSON.parse(JSON.stringify(experience)),
            skill: skill,
            project: JSON.parse(JSON.stringify(project))
        }
    };
}

export default Page;