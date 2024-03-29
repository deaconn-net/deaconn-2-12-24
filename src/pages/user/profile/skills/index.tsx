import { useSession } from "next-auth/react";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import UserSettingsPanel from "@components/user/SettingsPanel";
import SkillBrowser from "@components/user/skill/Browser";
import SkillForm from "@components/forms/user/Skill";
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
                title="My Skills - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {session?.user ? (
                        <UserSettingsPanel view="skills">
                            <div className="content-item2">
                                <div>
                                    <h2>Add Skill</h2>
                                </div>
                                <div>
                                    <SkillForm />
                                </div>
                            </div>
                            <div className="content-item">
                                <h2>Existing Skills</h2>
                                <SkillBrowser
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