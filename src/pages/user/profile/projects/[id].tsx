import { getSession } from "next-auth/react";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type UserProjectWithSourcesAndUser } from "~/types/user/project";

import { prisma } from "@server/db";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import UserSettingsPanel from "@components/user/settings_panel";
import NotSignedIn from "@components/errors/not_signed_in";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<{
    project?: UserProjectWithSourcesAndUser
} & GlobalPropsType> = ({
    project,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Editing Project ${project?.name ?? "N/A"} - My Projects - Deaconn`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {project ? (
                            <UserSettingsPanel
                                view="projects"
                                project={project}
                            />
                        
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

    // Retrieve experience ID if any.
    const { params } = ctx;

    const projectId = params?.id?.toString();
   
    // Initialize project.
    let project: UserProjectWithSourcesAndUser | null = null;

    // If project ID is valid and signed in, retrieve project.
    if (session?.user && projectId) {
            project = await prisma.userProject.findFirst({
                include: {
                    user: true,
                    sources: true
                },
                where: {
                    userId: session.user.id,
                    id: Number(projectId)
                },

            });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,

            project: JSON.parse(JSON.stringify(project))
        }
    };
}

export default Page;