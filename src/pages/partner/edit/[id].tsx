import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Partner } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import Meta from "@components/Meta";

import PartnerForm from '@components/forms/partner/New';
import NoPermissions from "@components/error/NoPermissions";

import { HasRole } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import NotFound from "@components/error/NotFound";
import { useSession } from "next-auth/react";

export default function Page ({
    partner,
    
    footerServices,
    footerPartners
} : {
    partner?: Partner
} & GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = HasRole(session, "CONTRIBUTOR") || HasRole(session, "ADMIN");

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
                    {
                        name: "Editing"
                    },
                    ...(partner ? [{
                        name: partner.name,
                        url: `/partner/edit/${partner.id.toString()}`
                    }] : [])
                ]}
                footerServices={footerServices}
                footerPartners={footerPartners}
            >
                {(authed && partner) ? (
                    <div className="content-item2">
                        <div>
                            <h2>Edit Partner {partner.name}</h2>
                        </div>
                        <div>
                            <PartnerForm
                                partner={partner}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {partner ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Partner" />
                        )}
                    </>
                )}
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Check if we're authenticated.
    const authed = HasRole(session, "CONTRIBUTOR") || HasRole(session, "ADMIN");

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
            partner: partner
        }
    };
}