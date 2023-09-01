import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { useSession } from "next-auth/react";

import { type Service } from "@prisma/client";

import Tabs, { type TabItemType } from "@components/tabs/Tabs";
import TabMenuWithData from "@components/tabs/MenuWithData";
import IconAndText from "@components/containers/IconAndText";
import Markdown from "@components/markdown/Markdown";

import ViewIcon from "@components/icons/View";
import DownloadIcon from "@components/icons/Download";
import PurchaseIcon from "@components/icons/Purchase";

import { api } from "@utils/Api";
import { has_role } from "@utils/user/Auth";
import { ScrollToTop } from "@utils/Scroll";

export default function ServiceView ({
    service,
    view
} : {
    service: Service,
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
        ...(service.gitLink ? [{
            url: service.gitLink,
            text: <>Source Code</>,
            className: "bg-green-800",
            target: "_blank"
        }] : [])
    ];
    
    return (
        <div className="flex flex-col gap-4">
            {banner && (
                <div className="w-full flex justify-center">
                    <Image
                        src={banner}
                        className="w-full max-h-[32rem] max-w-full min-h-[32rem] object-cover"
                        width={1024}
                        height={512}
                        alt="Banner"
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
                    <div>
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
                                    <Markdown>
                                        {service.content}
                                    </Markdown>
                                </>
                            )}
                            {service.install && view == "install" && (
                                <>
                                    <h2>Installation</h2>
                                    <Markdown>
                                        {service.install}
                                    </Markdown>
                                </>
                            )}
                            {service.features && view == "features" && (
                                <>
                                    <h2>Features</h2>
                                    <Markdown>
                                        {service.features}
                                    </Markdown>
                                </>
                            )}
                        </div>
                        {session && (has_role(session, "admin") || has_role(session, "moderator")) && (
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
                }
            />
        </div>
    );
}