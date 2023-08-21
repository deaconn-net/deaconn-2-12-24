import { useSession } from "next-auth/react";
import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import UserSettingsPanel from "@components/user/settings_panel";
import ProjectBrowser from "@components/user/project/browser";
import ProjectForm from "@components/forms/user/project";
import NotSignedIn from "@components/error/not_signed_in";

import GlobalProps, { type GlobalPropsType } from "@utils/global_props";

const Page: NextPage<GlobalPropsType> = ({
    footerServices,
    footerPartners
}) => {
    const { data: session } = useSession();

    return (
        <>
            <Meta
                title="My Projects - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {session?.user ? (
                        <UserSettingsPanel view="projects">
                            <div className="content-item">
                                <h2>Add Project</h2>
                                <ProjectForm />
                            </div>
                            <div className="content-item">
                                <h2>Existing Projects</h2>
                                <ProjectBrowser
                                    userId={session.user.id}
                                    small={true}
                                />
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

export async function getServerSideProps() {
    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps
        }
    };
}

export default Page;