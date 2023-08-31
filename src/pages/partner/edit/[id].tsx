import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Partner } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import PartnerForm from '@components/forms/partner/New';
import NoPermissions from "@components/error/NoPermissions";

import { has_role } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import NotFound from "@components/error/NotFound";

const Page: NextPage<{
    authed: boolean,
    partner?: Partner
} & GlobalPropsType> = ({
    authed,
    partner,
    
    footerServices,
    footerPartners
}) => {
    return (
        <>
            <Meta
                title={`Editing Partner ${partner?.name ?? "N/A"} - Partners - Deaconn`}
                robots="noindex"
            />
            <Wrapper
                breadcrumbs={[
                    {
                        name: "Partners",
                        url: "/partner"
                    },
                    ...(partner ? [{
                        name: `Editing Partner ${partner.name}`,
                        url: `/partner/edit/${partner.id.toString()}`
                    }] : [])
                ]}
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                <div className="content-item">
                    {(authed && partner) ? (
                        <>
                            <h1>Edit Partner</h1>
                            <PartnerForm
                                partner={partner}
                            />
                        </>
                    ) : (
                        <>
                            {partner ? (
                                <NoPermissions />
                            ) : (
                                <NotFound item="Partner" />
                            )}
                        </>
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Check if we're authenticated.
    let authed = false;

    if (session && (has_role(session, "contributor") || has_role(session, "admin")))
        authed = true;

    // Retrieve lookup ID.
    const { params } = ctx;

    const lookupId = params?.id?.toString();

    // Initialize partner.
    let partner: Partner | null = null;

    // Retrieve partner if we have a lookup ID and are authenticated.
    if (lookupId && authed) {
        partner = await prisma.partner.findFirst({
            where: {
                id: Number(lookupId)
            }
        });
    }

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return { 
        props: {
            ...globalProps,
            authed: authed,
            partner: partner
        }
    };
}

export default Page;