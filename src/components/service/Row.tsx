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

import { HasRole } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";

export default function ServiceRow ({
    service,
    simple = false
} : {
    service: Service
    simple?: boolean
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

    const isContributor = HasRole(session, "CONTRIBUTOR") || HasRole(session, "ADMIN");
    const isMod = HasRole(session, "MODERATOR") || HasRole(session, "ADMIN");

    return (
        <div className={`w-full bg-gradient-to-b from-deaconn-data to-deaconn-data2 shadow-lg shadow-black rounded flex flex-col gap-2 ring-4 ring-deaconn-ring hover:ring-deaconn-ring2 hover:duration-150 translate-y-0 hover:-translate-y-1 group ${simple ? "h-96" : "h-auto"}`}>
            {banner && (
                <div className={`${simple ? "h-1/2" : "h-64"}`}>
                    <Link href={viewUrl}>
                        <Image
                            src={banner}
                            width={600}
                            height={400}
                            className="h-full max-h-full w-full filter brightness-[85%] group-hover:brightness-100 rounded-t object-cover"
                            alt="Service Banner"
                        />
                    </Link>
                </div>
            )}
            <div>
                <h3 className="text-lg text-bold text-center text-white hover:text-blue-200 not-italic">
                    <Link href={viewUrl}>{service.name}</Link>
                </h3>
            </div>
            {service.desc && (
                <div className={`px-6 ${simple ? "max-h-16 overflow-hidden overflow-ellipsis whitespace-nowrap" : ""}`}>
                    <span className="text-sm">{service.desc}</span>
                </div>
            )}
            <div className="grow"></div>
            <div className="px-6 py-2 flex justify-center">
                <p className="font-bold text-green-200">{(service.price > 0) ? "$" + service.price.toString() + "/m" : "Free"}</p>
            </div>
            <div className="px-6 py-2 flex flex-wrap justify-between text-white text-sm">
                <IconAndText
                    icon={
                        <ViewIcon
                            className="w-6 h-6 fill-white"
                        />
                    }
                    text={<>{service.totalViews}</>}
                    inline={true}
                />
                <IconAndText
                    icon={
                        <DownloadIcon
                            className="w-6 h-6 fill-white"
                        />
                    }
                    text={<>{service.totalDownloads}</>}
                    inline={true}
                />
                <IconAndText
                    icon={
                        <PurchaseIcon
                            className="w-6 h-6 fill-white"
                        />
                    }
                    text={<>{service.totalPurchases}</>}
                    inline={true}
                />
            </div>
            {!simple && (
                <div className="px-6 py-4 flex flex-wrap gap-2 justify-center">
                    <Link
                        className="button w-full"
                        href={viewUrl}
                    >View</Link>
                    {service.openSource && service.gitLink ? (
                        <Link
                            className="button w-full"
                            target="_blank"
                            href={service.gitLink}
                        >Source Code</Link>
                    ) : (
                        <div className="p-7"></div>
                    )}
                </div>
            )}
            {(!simple && (isContributor || isMod)) && (
                <div className="px-6 py-4 flex flex-wrap gap-2 justify-center">
                    {isContributor && (
                        <Link
                            className="button button-primary w-full"
                            href={editUrl}
                        >Edit</Link>    
                    )}
                    {isMod && ( 
                        <button
                            type="button"
                            className="button button-danger w-full"
                            onClick={() => {
                                const yes = confirm("Are you sure you want to delete this service?");

                                if (yes) {
                                    deleteMut.mutate({
                                        id: service.id
                                    });
                                }
                            }}
                        >Delete</button>  
                    )}
                </div>
            )}
        </div>
    );
}