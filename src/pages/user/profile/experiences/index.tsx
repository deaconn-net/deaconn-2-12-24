import { useSession } from "next-auth/react";
import { type NextPage } from "next";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";

import UserSettingsPanel from "@components/user/settings_panel";
import ExperienceBrowser from "@components/user/experience/browser";
import ExperienceForm from "@components/forms/user/experience";
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
                title="My Experiences - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {session?.user ? (
                        <UserSettingsPanel view="experiences">
                            <div className="content-item">
                                <h2>Add Experience</h2>
                                <ExperienceForm />
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