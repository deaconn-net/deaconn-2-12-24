import { useContext } from "react";
import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@server/auth";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Partner } from "@prisma/client";

import { prisma } from "@server/db";

import Wrapper from "@components/Wrapper";
import AdminSettingsPanel from "@components/admin/SettingsPanel";
import NoPermissions from "@components/error/NoPermissions";

import { api } from "@utils/Api";
import { has_role } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";
import GlobalProps, { type GlobalPropsType } from "@utils/GlobalProps";

import PartnerForm from "@components/forms/partner/New";
import { useSession } from "next-auth/react";

export default function Page ({
    partners,

    footerServices,
    footerPartners
} : {
    partners?: Partner[]
} & GlobalPropsType) {
    // Retrieve session and check if user is authed.
    const { data: session } = useSession();
    const authed = has_role(session, "admin");

    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Prepare mutations.
    const partnerDeleteMut = api.partner.delete.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Partner Not Deleted");
                errorCtx.setMsg("Partner not deleted successfully.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Partner Deleted!");
                successCtx.setMsg("Partner deleted successfully.");

                ScrollToTop();
            }
        }
    });

    return (
        <Wrapper
            footerServices={footerServices}
            footerPartners={footerPartners}
        >
            {authed ? (
                <div className="content-item">
                    <h2>Admin Panel</h2>
                    <AdminSettingsPanel view="partners">
                        <div className="flex flex-col gap-4">
                            <div className="content-item2">
                                <div>
                                    <h2>Add Partner</h2>
                                </div>
                                <div>
                                    <PartnerForm />
                                </div>
                            </div>
                            {partners && partners.length > 0 && (
                                <div className="content-item">
                                    <h2>Existing Partners</h2>
                                    <div className="flex gap-4">
                                        {partners.map((partner) => {
                                            // Compile links.
                                            const editUrl = `/admin/partner/edit/${partner.id.toString()}`;

                                            return (
                                                <div
                                                    key={`admin-partners-${partner.id.toString()}`}
                                                    className="content-item2"
                                                >
                                                    <div>
                                                        <h2 className="text-center">{partner.name}</h2>
                                                    </div>
                                                    <div className="flex flex-col gap-4 h-full">
                                                        <p className="italic">
                                                            <Link
                                                                href={`https://${partner.url}`}
                                                                target="_blank"
                                                            >
                                                                {partner.url}
                                                            </Link>
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Link
                                                                href={editUrl}
                                                                className="button button-primary"
                                                            >Edit</Link>
                                                            <button
                                                                className="button button-danger"
                                                                onClick={(e) => {
                                                                    e.preventDefault();

                                                                    const yes = confirm("Are you sure you want to delete this partner?");

                                                                    if (yes) {
                                                                        partnerDeleteMut.mutate({
                                                                            id: partner.id
                                                                        });
                                                                    }
                                                                }}
                                                            >Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </AdminSettingsPanel>
                </div>
            ) : (
                <NoPermissions />
            )}
        </Wrapper>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve session.
    const session = await getServerAuthSession(ctx);

    // Make sure we're authenticated.
    const authed = has_role(session, "admin");

    // Initialize partners.
    let partners: Partner[] | undefined = undefined;

    // If we're authenticated, retrieve partners.
    if (authed)
        partners = await prisma.partner.findMany();

    // Retrieve global props.
    const globalProps = await GlobalProps();

    return {
        props: {
            ...globalProps,
            partners: partners ? JSON.parse(JSON.stringify(partners)) : null
        }
    }
}