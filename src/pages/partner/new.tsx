import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import PartnerForm from '@components/forms/partner/New';
import NoPermissions from "@components/error/NoPermissions";

import { HasRole } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import { useSession } from "next-auth/react";

export default function Page ({
    footerServices,
    footerPartners
} : GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = HasRole(session, "CONTRIBUTOR") || HasRole(session, "ADMIN");

    return (
        <>
            <Meta
                title="New Partner - Partners - Deaconn"
                robots="noindex"
            />
            <Wrapper
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {authed ? (
                    <div className="content-item2">
                        <div>
                            <h1>Add Partner</h1>
                        </div>
                        <div>
                            <PartnerForm />
                        </div>
                    </div>
                ) : (
                    <NoPermissions />
                )}
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