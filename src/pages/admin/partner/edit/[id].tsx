import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";

import { type Partner } from "@prisma/client"

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";
import NotFound from "@components/error/NotFound";

import { HasRole } from "@utils/user/Auth";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";
import PartnerForm from "@components/forms/partner/New";
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
    const authed = HasRole(session, "ADMIN");

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            <div className="content-item">
                <h2>Admin Panel</h2>
                {(authed && partner) ? (
                    <AdminSettingsPanel view="partners">
                        <div className="content-item2">
                            <div>
                                <h2>Editing Partner {partner.name}</h2>
                            </div>
                            <div>
                                <PartnerForm
                                    partner={partner}
                                />
                            </div>
                        </div>
                    </AdminSettingsPanel>
                ) : (
                    <>
                        {!authed ? (
                            <NoPermissions />
                        ) : (
                            <NotFound item="Partner" />
                        )}
                    </>
                )}
            </div>
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Check if we have permissions.
    const authed = HasRole(session, "ADMIN");

    // Retrieve partner ID.
    const { params } = ctx;

    const partnerId = params?.id?.toString();

    // Initialize partner.
    let partner: Partner | null = null;

    // If we're authenticated and have a partner ID, retrieve partner.
    if (authed && partnerId) {
        partner = await prisma.partner.findFirst({
            where: {
                id: Number(partnerId)
            }
        })
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