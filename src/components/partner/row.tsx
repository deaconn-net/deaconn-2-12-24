import Image from "next/image";
import Link from "next/link";

import { type Partner } from "@prisma/client";

export default function PartnerRow ({
    partner,
    showInline,
    iconWidth=32,
    iconHeight=32,
    bannerWidth=300,
    bannerHeight=300
} : {
    partner: Partner,
    showInline?: boolean,
    iconWidth?: number,
    iconHeight?: number,
    bannerWidth?: number,
    bannerHeight?: number
}) {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const upload_url = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";
    const banner = cdn + upload_url + (partner?.banner ?? "");
    const icon = cdn + upload_url + (partner?.icon ?? "");

    return (
        <>
            {partner.banner ? (
                <div className="flex justify-center">
                    <Link
                        href={partner.url}
                        target="_blank"
                    >
                        <Image
                            src={banner}
                            width={bannerWidth}
                            height={bannerHeight}
                            alt="Banner"
                        />
                    </Link>
                </div>
            ) : (
                <div>
                    <Link
                        href={partner.url}
                        target="_blank"
                        className={`flex ${!showInline ? "flex-col" : "flex-wrap"} gap-2 items-center`}
                    >
                        {partner.icon && (
                            <Image
                                src={icon}
                                width={iconWidth}
                                height={iconHeight}
                                alt="Icon"
                            />
                        )}
                        <span>{partner.name}</span>
                    </Link>
                </div>
            )}
        </>
    );
}