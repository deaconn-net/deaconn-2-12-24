import Image from "next/image";
import Link from "next/link";

import { type Partner } from "@prisma/client";

export default function PartnerRow ({
    partner,
    showInline,
    iconWidth=32,
    iconHeight=32,
    bannerWidth=500,
    bannerHeight=300,
    bannerClassName
} : {
    partner: Partner,
    showInline?: boolean,
    iconWidth?: number,
    iconHeight?: number,
    bannerWidth?: number,
    bannerHeight?: number,
    bannerClassName?: string
}) {
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";
    const banner = uploadUrl + (partner?.banner ?? "");
    const icon = uploadUrl + (partner?.icon ?? "");

    return (
        <>
            {partner.banner ? (
                <div className="flex justify-center">
                    <Link
                        href={`https://${partner.url}`}
                        target="_blank"
                        className={bannerClassName}
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
                        href={`https://${partner.url}`}
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