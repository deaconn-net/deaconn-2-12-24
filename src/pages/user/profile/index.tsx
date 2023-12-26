import { getServerAuthSession } from "@server/auth";
import { type GetServerSidePropsContext } from "next";

import { type User } from "@prisma/client";
import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import UserSettingsPanel from "@components/user/SettingsPanel";
import GeneralForm from "@components/forms/user/General";
import NotSignedIn from "@components/error/NotSignedIn";

import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

export default function Page ({
    user,

    footerServices,
    footerPartners
} : {
    user?: User
} & GlobalPropsType) {
    return (
        <>
            <Meta
                title="My Profile - Deaconn"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item"> 
                    {user ? (
                        <UserSettingsPanel
                            view="general"
                        >
                            <div className="content-item2">
                                <div>
                                    <h2>General</h2>
                                </div>
                                <div>
                                    <GeneralForm
                                        user={user}
                                    />
                                </div>
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
   
    // Initialize user and skill.
    let user: User | null = null;

    // If signed in, retrieve user.
    if (session?.user) {
        // Retrieve user.
        user = await prisma.user.findFirst({
            where: {
                id: session.user.id
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,

            user: JSON.parse(JSON.stringify(user))
        }
    };
}