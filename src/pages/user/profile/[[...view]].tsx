import { getSession } from "next-auth/react";
import { GetServerSidePropsContext, NextPage } from "next";

import { type User, type UserExperience, type UserProject, type UserSkill } from "@prisma/client";

import Wrapper from '@components/wrapper';
import UserSettingsPanel from "@components/forms/user/settings_panel";
import NoPermissions from "@components/errors/no_permissions";

import { prisma } from "@server/db";

const Page: NextPage<{
    authed: boolean,
    view: string,

    user?: User,
    experience?: UserExperience,
    project?: UserProject,
    skill?: UserSkill
}> = ({
    authed,
    view,

    user,
    experience,
    project,
    skill
}) => {
    return (
        <Wrapper>
            <div className="content">
                {authed ? (
                    <UserSettingsPanel
                        current={view}

                        user={user}
                        experience={experience}
                        project={project}
                        skill={skill}
                    />
                ) : (
                    <NoPermissions />
                )}
            </div>
        </Wrapper>
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
    let view = params?.view ? params?.view[0] ?? undefined : undefined;

    if (!view || !["general", "experiences", "skills", "projects"].includes(view))
        view = "general";

    const lookup_id = query?.id;

    let user: User | null = null;
    let experience: UserExperience | null = null;
    let skill: UserSkill | null = null;
    let project: UserProject | null = null;

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

    return {
        props: {
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