import Link from "next/link";
import Image from "next/image";

import { type Service } from "@prisma/client";

import { api } from "@utils/api";
import SuccessBox from "@utils/success";
import IconAndText from "@components/containers/icon_and_text";

import ReactMarkdown from "react-markdown";
import ViewIcon from "@utils/icons/view";
import PurchaseIcon from "@utils/icons/purchase";
import DownloadIcon from "@utils/icons/download";

const Row: React.FC<{
    service: Service,
    small?: boolean
}> = ({
    service,
    small = false
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const upload_url = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";
    
    const viewUrl = "/service/view/" + service.url;
    const editUrl = "/service/new?id=" + service.id.toString();

    const banner = (service.banner) ? cdn + upload_url + service.banner : "/images/service/default.jpg";

    const deleteMut = api.service.delete.useMutation();

    return (
        <>
            {deleteMut.isSuccess ? (
                <SuccessBox
                    title={"Successfully Deleted!"}
                    msg={"Successfully deleted service ID #" + service.id.toString() + "."}
                />
            ) : (
                <div className={"service-row " + ((small) ? "service-row-sm" : "service-row-lg")}>
                    <div className="service-row-image">
                        <Image
                            src={banner}
                            width={300}
                            height={300}
                            alt="Service Banner"
                        />
                    </div>
                    <div className="service-row-name">
                        <h3>{service.name}</h3>
                    </div>
                    <div className="service-row-description">
                        <ReactMarkdown
                            className="markdown"
                        >
                            {service.desc ?? ""}
                        </ReactMarkdown>
                    </div>
                    <div className="service-row-price">
                        <p>{(service.price > 0) ? "$" + service.price.toString() + "/m" : "Free"}</p>
                    </div>
                    <div className="service-row-stats">
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
                    <div className="service-row-links">
                        <Link className="button" href={viewUrl}>View</Link>
                        {service.openSource && service.gitLink && (
                            <Link className="button" target="_blank" href={service.gitLink}>Source Code</Link>
                        )}
                    </div>
                    <div className="service-row-actions">
                        <Link className="button button-primary" href={editUrl}>Edit</Link>
                        <Link className="button button-danger" href="#" onClick={(e) => {
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