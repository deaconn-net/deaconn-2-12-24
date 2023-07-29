import Link from "next/link";

import { type Service } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";

import ReactMarkdown from "react-markdown";
import View from "@utils/icons/view";
import Purchase from "@utils/icons/purchase";
import Download from "@utils/icons/download";

const Row: React.FC<{
    service: Service,
    small?: boolean
}> = ({
    service,
    small = false
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    
    const viewUrl = "/service/view/" + service.url;
    const editUrl = "/service/new?id=" + service.id;

    const banner = (service.banner) ? cdn + service.banner : "/images/service/default.jpg";

    const deleteMut = api.service.delete.useMutation();

    return (
        <>
            {deleteMut.isSuccess ? (
                <SuccessBox
                    title={"Successfully Deleted!"}
                    msg={"Successfully deleted service ID #" + service.id + "."}
                />
            ) : (
                <div className={"service-row " + ((small) ? "service-row-sm" : "service-row-lg")}>
                    <div className={"w-full " + ((small) ? "h-48" : "h-72")}>
                        <img src={banner} className="w-full h-full max-h-full" />
                    </div>
                    <div className="">
                        <h3 className="text-white text-2xl font-bold text-center">{service.name}</h3>
                    </div>
                    <div className="pb-6 grow">
                        <ReactMarkdown
                            className="markdown"
                        >
                            {service.desc ?? ""}
                        </ReactMarkdown>
                    </div>
                    <div className="pb-6 flex justify-center">
                        <p className="text-xl text-green-300 font-bold italic">{(service.price > 0) ? "$" + service.price + "/m" : "Free"}</p>
                    </div>
                    <div className="pb-6 flex justify-between text-white text-sm">
                        <div className="flex flex-wrap items-center">
                            <span>
                                <View
                                    classes={["w-6", "h-6", "fill-white"]}
                                />
                            </span>
                            <span className="ml-1">{service.views}</span>
                        </div>
                        <div className="flex flex-wrap items-center">
                            <span>
                                <Download
                                    classes={["w-6", "h-6", "fill-white"]}
                                />
                            </span>
                            <span className="ml-1">{service.downloads}</span>
                        </div>
                        <div className="flex flex-wrap items-center">
                            <span>
                                <Purchase
                                    classes={["w-6", "h-6", "fill-white"]}
                                />
                            </span>
                            <span className="ml-1">{service.purchases}</span>
                        </div>
                    </div>
                    <div className="p-6 flex flex-wrap gap-2 justify-center">
                        <Link className="w-full button" href={viewUrl}>View</Link>
                        {service.openSource && service.gitLink && (
                            <a className="w-full button" target="_blank" href={service.gitLink}>Source Code</a>
                        )}
                    </div>
                    <div className="p-6 flex flex-wrap gap-2 justify-center">
                        <Link className="w-full button button-secondary" href={editUrl}>Edit</Link>
                        <Link className="w-full button button-delete" href="#" onClick={(e) => {
                            e.preventDefault();

                            const yes = confirm("Are you sure you want to delete this service?");

                            if (yes) {
                                deleteMut.mutate({
                                    id: service.id
                                });
                            }
                        }}>Delete</Link>

                    </div>
                </div>
            )}
        </>
    );
}

export default Row;