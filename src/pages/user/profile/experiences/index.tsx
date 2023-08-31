import { useSession } from "next-auth/react";
import { type NextPage } from "next";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import UserSettingsPanel from "@components/user/SettingsPanel";
import ExperienceBrowser from "@components/user/experience/Browser";
import ExperienceForm from "@components/forms/user/Experience";
import NotSignedIn from "@components/error/NotSignedIn";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

const Page: NextPage<GlobalPropsType> = ({
    footerServices,
    footerPartners
}) => {
    const { data: session } = useSession();

    return (
        <>
            <Meta
                title="My Experiences - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {session?.user ? (
                        <UserSettingsPanel view="experiences">
                            <div className="content-item2">
                                <div>
                                    <h2>Add Experience</h2>
                                </div>
                                <div>
                                    <ExperienceForm />
                                </div>
                            </div>
                            <div className="content-item">
                                <h2>Existing Experiences</h2>
                                <ExperienceBrowser
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