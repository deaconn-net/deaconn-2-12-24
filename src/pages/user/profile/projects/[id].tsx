import { getSession } from "next-auth/react";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type UserProjectWithSourcesAndUser } from "~/types/user/project";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import UserSettingsPanel from "@components/user/SettingsPanel";
import ProjectForm from "@components/forms/user/Project";
import NotSignedIn from "@components/error/NotSignedIn";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

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
                        <UserSettingsPanel view="projects">
                            <div className="content-item">
                                <h2>Edit Project {project.name}</h2>
                                <ProjectForm project={project} />
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