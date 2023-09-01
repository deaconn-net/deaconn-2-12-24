import { useContext } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { type Service } from "@prisma/client";

import IconAndText from "@components/containers/IconAndText";
import ViewIcon from "@components/icons/View";
import PurchaseIcon from "@components/icons/Purchase";
import DownloadIcon from "@components/icons/Download";

import { api } from "@utils/Api";

import { has_role } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";

export default function ServiceRow ({
    service
} : {
    service: Service
}) {
    // Error and success handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Retrieve session.
    const { data: session } = useSession();

    // Retrieve environmental variables.
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    // Compile links.
    const viewUrl = `/service/view/${service.url}`;
    const editUrl = `/service/edit/${service.id.toString()}`;

    // Retrieve banner.
    let banner = process.env.NEXT_PUBLIC_DEFAULT_SERVICE_IMAGE || undefined;

    if (service.banner)
        banner = uploadUrl + service.banner;

    // Prepare delete mutation.
    const deleteMut = api.service.delete.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Delete Service");
                errorCtx.setMsg("Failed to delete service. Please check your console for more details.");
                
                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Successfully Deleted Service!");
                successCtx.setMsg("Successfully deleted service! Please refresh the page.");

                ScrollToTop();
            }
        }
    });

    return (
        <div className="service-row">
            {banner && (
                <div className="grid-view-image">
                    <Link href={viewUrl}>
                        <Image
                            src={banner}
                            width={600}
                            height={400}
                            alt="Service Banner"
                        />
                    </Link>
                </div>
            )}
            <div className="service-row-name">
                <h3>
                    <Link href={viewUrl}>{service.name}</Link>
                </h3>
            </div>
            {service.desc && (
                <div className="service-row-description">
                    <p>{service.desc}</p>
                </div>
            )}
            <div className="service-row-price">
                <p>{(service.price > 0) ? "$" + service.price.toString() + "/m" : "Free"}</p>
            </div>
            <div className="service-row-stats">
                <IconAndText
                    icon={
                        <ViewIcon
                            className="w-6 h-6 fill-white"
                        />
                    }
                    text={<>{service.totalViews}</>}
                />
                <IconAndText
                    icon={
                        <DownloadIcon
                            className="w-6 h-6 fill-white"
                        />
                    }
                    text={<>{service.totalDownloads}</>}
                />
                <IconAndText
                    icon={
                        <PurchaseIcon
                            className="w-6 h-6 fill-white"
                        />
                    }
                    text={<>{service.totalPurchases}</>}
                />
            </div>
            <div className="service-row-links">
                <Link
                    className="button"
                    href={viewUrl}
                >View</Link>
                {service.openSource && service.gitLink && (
                    <Link
                        className="button"
                        target="_blank"
                        href={service.gitLink}
                    >Source Code</Link>
                )}
            </div>
            {session && (
                <div className="service-row-actions">
                    {(has_role(session, "contributor") || has_role(session, "admin")) && (
                        <Link
                            className="button button-primary"
                            href={editUrl}
                        >Edit</Link>    
                    )}
                    {(has_role(session, "moderator") || has_role(session, "admin") && 
                        <Link
                            className="button button-danger"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();

                                const yes = confirm("Are you sure you want to delete this service?");

                                if (yes) {
                                    deleteMut.mutate({
                                        id: service.id
                                    });
                                }
                            }}
                        >Delete</Link>  
                    )}
                </div>
            )}
        </div>
    );
}