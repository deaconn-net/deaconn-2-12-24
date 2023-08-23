import { useContext, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { ErrorCtx, SuccessCtx } from "@pages/_app";

import { useSession } from "next-auth/react";

import { type Service } from "@prisma/client";

import Tabs, { type TabItemType } from "@components/tabs/tabs";
import TabMenuWithData from "@components/tabs/menu_with_data";
import IconAndText from "@components/containers/icon_and_text";
import Markdown from "@components/markdown/markdown";

import { api } from "@utils/api";
import { has_role } from "@utils/user/auth";

import ViewIcon from "@components/icons/view";
import DownloadIcon from "@components/icons/download";
import PurchaseIcon from "@components/icons/purchase";

const ServiceView: React.FC<{
    service: Service,
    view: string
}> = ({
    service,
    view
}) => {
    // Success and error handling.
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);
    
    // Retrieve session.
    const { data: session } = useSession();

    // Environmental variables.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    // Compile URLs.
    const viewUrl = `/service/view/${service?.url ?? ""}`;
    const editUrl = `/service/edit/${service?.id?.toString() ?? ""}`;

    // Retrieve banner.
    let banner = cdn + (process.env.NEXT_PUBLIC_DEFAULT_SERVICE_IMAGE ?? "");

    if (service?.banner)
        banner = cdn + uploadUrl + service.banner;

    // Prepare delete mutation.
    const deleteMut = api.service.delete.useMutation();

    useEffect(() => {
        if (deleteMut.isError && errorCtx) {
            console.error(deleteMut.error.message);
    
            errorCtx.setTitle("Failed To Delete Service");
            errorCtx.setMsg("Failed to delete service. Please check your console for more details.");
        } else if (deleteMut.isSuccess && successCtx) {
            successCtx.setTitle("Successfully Deleted Service!");
            successCtx.setMsg("Successfully deleted service. Please reload the page.");
        } 
    }, [deleteMut, errorCtx, successCtx])

    // Compile tabs.
    const tabs: TabItemType[] = [
        {
            url: viewUrl,
            text: <>Details</>,
            active: view == "details"
        },
        {
            url: `${viewUrl}/install`,
            text: <>Installation</>,
            active: view == "install"
        },
        {
            url: `${viewUrl}/features`,
            text: <>Features</>,
            active: view == "features"
        }
    ];
    
    return (
        <div className="flex flex-col gap-4">
            <div className="w-full flex justify-center">
                <Image
                    src={banner}
                    className="max-h-[32rem] max-w-full min-h-[32rem]"
                    width={1024}
                    height={512}
                    alt="Banner"
                />
            </div>
            <h1>{service.name}</h1>
            <TabMenuWithData
                data_background={true}
                menu={
                    <Tabs
                        items={tabs}
                        classes={["sm:w-64"]}
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
                                                classes={["w-6", "h-6", "fill-white"]}
                                            />
                                        }
                                        text={<>{service.views}</>}
                                    />
                                    <IconAndText
                                        icon={
                                            <DownloadIcon
                                                classes={["w-6", "h-6", "fill-white"]}
                                            />
                                        }
                                        text={<>{service.downloads}</>}
                                    />
                                    <IconAndText
                                        icon={
                                            <PurchaseIcon
                                                classes={["w-6", "h-6", "fill-white"]}
                                            />
                                        }
                                        text={<>{service.purchases}</>}
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

export default ServiceView;