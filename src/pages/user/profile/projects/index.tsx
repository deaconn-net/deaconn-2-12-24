import { useSession } from "next-auth/react";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import UserSettingsPanel from "@components/user/SettingsPanel";
import ProjectBrowser from "@components/user/project/Browser";
import ProjectForm from "@components/forms/user/Project";
import NotSignedIn from "@components/error/NotSignedIn";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    footerServices,
    footerPartners
} : GlobalPropsType) {
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
                            <div className="content-item2">
                                <div>
                                    <h2>Add Project</h2>
                                </div>
                                <div>
                                    <ProjectForm />
                                </div>
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