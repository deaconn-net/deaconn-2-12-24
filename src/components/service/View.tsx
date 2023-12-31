import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { useSession } from "next-auth/react";

import { type ServiceWithCategoryAndLinks } from "~/types/service";


import Tabs, { type TabItemType } from "@components/tabs/Tabs";
import TabMenuWithData from "@components/tabs/MenuWithData";
import IconAndText from "@components/containers/IconAndText";
import Markdown from "@components/markdown/Markdown";

import ViewIcon from "@components/icons/View";
import DownloadIcon from "@components/icons/Download";
import PurchaseIcon from "@components/icons/Purchase";
import LinkIcon from "@components/icons/Link";

import { api } from "@utils/Api";
import { HasRole } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";
import { type ServiceLink } from "@prisma/client";

export default function ServiceView ({
    service,
    view
} : {
    service: ServiceWithCategoryAndLinks,
    view: string
}) {
    // Success and error handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);
    
    // Retrieve session.
    const { data: session } = useSession();

    // Environmental variables.
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    // Compile URLs.
    const viewUrl = `/service/view/${service?.url ?? ""}`;
    const editUrl = `/service/edit/${service?.id?.toString() ?? ""}`;

    // Retrieve banner.
    let banner = process.env.NEXT_PUBLIC_DEFAULT_SERVICE_IMAGE || undefined;

    if (service?.banner)
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
                successCtx.setMsg("Successfully deleted service. Please reload the page.");

                ScrollToTop();
            }
        }
    });

    // Compile tabs.
    const tabs: TabItemType[] = [
        {
            url: viewUrl,
            text: <>Details</>,
            active: view == "details"
        },
        ...(service.install ? [{
            url: `${viewUrl}/install`,
            text: <>Installation</>,
            active: view == "install"
        }] : []),
        ...(service.features ? [{
            url: `${viewUrl}/features`,
            text: <>Features</>,
            active: view == "features"
        }] : []),
        ...(service.links?.length > 0 ? [{
            url: `${viewUrl}/links`,
            text: <>Links</>,
            active: view == "links"
        }] : []),
        ...(service.gitLink ? [{
            url: service.gitLink,
            text: <>Source Code</>,
            className: "!bg-green-800",
            target: "_blank"
        }] : [])
    ];
    
    return (
        <div className="flex flex-col gap-4">
            {banner && (
                <div className="w-full flex justify-center container mx-auto">
                    <Image
                        src={banner}
                        className="w-full object-cover max-h-screen"
                        width={1920}
                        height={1080}
                        alt="Banner"
                        priority={true}
                    />
                </div>
            )}
            <h1>{service.name}</h1>
            <TabMenuWithData
                data_background={true}
                menu={
                    <Tabs
                        items={tabs}
                        className="sm:w-64"
                    />
                }
                data={
                    <div className="p-6">
                        <div className="flex flex-wrap justify-between">
                            <div>
                                <p className="text-green-300 font-bold italic">{service.price > 0 ? "$" + service.price + "/m" : "Free"}</p>
                            </div>
                            <div>
                                <div className="flex flex-wrap gap-6">
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
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            {view == "details" && (
                                <>
                                    <h2>Details</h2>
                                    <Markdown rehype={true}>
                                        {service.content}
                                    </Markdown>
                                </>
                            )}
                            {service.install && view == "install" && (
                                <>
                                    <h2>Installation</h2>
                                    <Markdown rehype={true}>
                                        {service.install}
                                    </Markdown>
                                </>
                            )}
                            {service.features && view == "features" && (
                                <>
                                    <h2>Features</h2>
                                    <Markdown rehype={true}>
                                        {service.features}
                                    </Markdown>
                                </>
                            )}
                            {service.links?.length > 0 && view == "links" && (
                                <>
                                    <h2>Links</h2>
                                    <div className="flex flex-wrap gap-4">
                                        {service.links.map((link, index) => {
                                            return (
                                                <ServiceLink
                                                    key={`link-${index.toString()}`}
                                                    link={link}
                                                />
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                            {(HasRole(session, "ADMIN") || HasRole(session, "MODERATOR")) && (
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Link
                                        href={editUrl}
                                        className="button button-primary"
                                    >Edit</Link>
                                    <button
                                        className="button button-danger"
                                        onClick={(e) => {
                                            e.preventDefault();

                                            const yes = confirm("Are you sure you want to delete this article?");

                                            if (yes) {
                                                deleteMut.mutate({
                                                    id: service.id
                                                });
                                            }
                                        }}
                                    >Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                }
            />
        </div>
    );
}

function ServiceLink ({
    link
} : {
    link: ServiceLink
}) {
    // Prepare increment downloads mutation.
    const incDownloadsMut = api.service.incDownloads.useMutation();

    return (
        <Link
            href={link.url}
            className="bg-cyan-700 hover:bg-cyan-600 p-4 rounded w-full sm:w-auto sm:min-w-[24rem] sm:max-w-full hover:text-white"
            target="_blank"
            onClick={() => {
                if (link.isDownload) {
                    incDownloadsMut.mutate({
                        id: link.serviceId
                    });
                }
            }}
        >
            <IconAndText
                icon={
                    <>
                        {link.isDownload ? (
                            <DownloadIcon
                                className="w-10 h-10 fill-white"
                            />
                        ) : (
                            <LinkIcon
                                className="w-10 h-10 stroke-white fill-none"
                            />
                        )}
                    </>
                }
                text={
                    <>{link.title}</>
                }
                inline={true}
            />
        </Link>
    )
}