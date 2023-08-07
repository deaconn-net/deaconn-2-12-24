import { type GetServerSidePropsContext, type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { type Service } from ".prisma/client";

import Wrapper from "@components/wrapper";
import Meta from "@components/meta";
import NotFound from "@components/errors/not_found";
import IconAndText from "@components/containers/icon_and_text";
import TabMenuWithData from "@components/tabs/tab_menu_with_data";

import { prisma } from "@server/db";

import { api } from "@utils/api";
import ViewIcon from "@utils/icons/view";
import DownloadIcon from "@utils/icons/download";
import PurchaseIcon from "@utils/icons/purchase";
import { has_role } from "@utils/user/auth";
import SuccessBox from "@utils/success";

import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import Tabs, { TabItemType } from "@components/tabs/tabs";

const Page: NextPage<{
    service: Service | null,
    view: string
}> = ({
    service,
    view
}) => {
    // Retrieve session.
    const { data: session } = useSession();

    // Environmental variables.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";

    // Compile URLs.
    const viewUrl = "/service/view/" + (service?.url ?? "");
    const editUrl = "/service/new?id=" + (service?.id?.toString() ?? "");

    // Retrieve banner.
    let banner = cdn + (process.env.NEXT_PUBLIC_DEFAULT_SERVICE_IMAGE ?? "");

    if (service?.banner)
        banner = cdn + uploadUrl + service.banner;

    // Prepare delete mutation.
    const deleteMut = api.service.delete.useMutation();

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
        <>
            <Meta
                title={`${service?.name ?? "Not Found"}${view != "details" ? " - " + view.charAt(0).toUpperCase() + view.slice(1) : ""} - Services - Deaconn`}
                description={`${service?.desc ?? "Service not found."}`}
            />
            <Wrapper>
                <div className="content-item">
                    {deleteMut.isSuccess && (
                        <SuccessBox
                            title="Successfully Deleted Service!"
                            msg={`Deleted service ${service?.name}. Please reload the page.`}
                        />
                    )}
                    {service ? (
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
                                        <div>
                                            {view == "details" && (
                                                <>
                                                    <h2>Details</h2>
                                                    <ReactMarkdown className="markdown">
                                                        {service.content}
                                                    </ReactMarkdown>
                                                </>
                                            )}
                                            {service.install && view == "install" && (
                                                <>
                                                    <h2>Installation</h2>
                                                    <ReactMarkdown className="markdown">
                                                        {service.install}
                                                    </ReactMarkdown>
                                                </>
                                            )}
                                            {service.features && view == "features" && (
                                                <>
                                                    <h2>Features</h2>
                                                    <ReactMarkdown className="markdown">
                                                        {service.features}
                                                    </ReactMarkdown>
                                                </>
                                            )}
                                        </div>
                                        {session && (has_role(session, "admin") || has_role(session, "moderator")) && (
                                            <div className="flex flex-wrap gap-4">
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
                    ) : (
                        <NotFound item="Service" />
                    )}
                </div>
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // Retrieve URL.
    const { params } = ctx;

    const lookup_url = params?.service?.[0];
    let view = params?.service?.[1] ?? "details";

    if (!["details", "install", "features"].includes(view))
        view = "details";

    // Service.
    let service: Service | null = null;

    if (lookup_url) {
        service = await prisma.service.findFirst({
            where: {
                url: lookup_url.toString()
            }
        });
    }

    // Increment view.
    if (service) {
        await prisma.service.update({
            where: {
                id: service.id
            },
            data: {
                views: {
                    increment: 1
                }
            }
        });
    }

    return {
        props: {
            service: JSON.parse(JSON.stringify(service)),
            view: view
        }
    };
}

export default Page;