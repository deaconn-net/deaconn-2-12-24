import { getServerAuthSession } from "@server/auth";
import { type GetServerSidePropsContext, type NextPage } from "next";

import { type UserExperienceWithUser } from "~/types/user/experience";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import UserSettingsPanel from "@components/user/SettingsPanel";
import ExperienceForm from "@components/forms/user/Experience";
import NotSignedIn from "@components/error/NotSignedIn";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<{
    experience?: UserExperienceWithUser,
} & GlobalPropsType> = ({
    experience,

    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Editing Experience ${experience?.title ?? "N/A"} - My Experiences - Deaconn`}
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {experience ? (
                        <UserSettingsPanel view="experiences">
                            <div className="content-item">
                                <h2>Edit Experience {experience.title}</h2>
                                <ExperienceForm experience={experience} />
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

    // Retrieve experience ID if any.
    const { params } = ctx;

    const experienceId = params?.id?.toString();
   
    // Initialize experience.
    let experience: UserExperienceWithUser | null = null;

    // If signed in and experience ID is valid, retrieve experience and user.
    if (session?.user && experienceId) {
        // Retrieve experience.
        experience = await prisma.userExperience.findFirst({
            include: {
                user: true
            },
            where: {
                userId: session.user.id,
                id: Number(experienceId)
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,

            experience: JSON.parse(JSON.stringify(experience))
        }
    };
}

export default Page;