import Image from "next/image";
import Link from "next/link";

import { type Partner } from "@prisma/client";

export default function PartnerRow ({
    partner,
    showInline,
    showBanner = true,
    showIcon = true,
    textClassName,
    iconWidth=32,
    iconHeight=32,
    bannerWidth=500,
    bannerHeight=300,
} : {
    partner: Partner
    showInline?: boolean
    showBanner?: boolean
    textClassName?: string
    showIcon?: boolean
    iconWidth?: number
    iconHeight?: number
    bannerWidth?: number
    bannerHeight?: number
}) {
    const uploadUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";
    const banner = uploadUrl + (partner?.banner ?? "");
    const icon = uploadUrl + (partner?.icon ?? "");

    return (
        <>
            {(partner.banner && showBanner) ? (
                <div className="flex justify-center">
                    <Link
                        href={`https://${partner.url}`}
                        target="_blank"
                        className="w-full"
                    >
                        <Image
                            src={banner}
                            priority={true}
                            width={bannerWidth}
                            height={bannerHeight}
                            alt="Banner"
                            className="w-full max-w-full"
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
                        {(partner.icon && showIcon) && (
                            <Image
                                src={icon}
                                width={iconWidth}
                                height={iconHeight}
                                style={{
                                    width: iconWidth,
                                    height: iconHeight
                                }}
                                alt="Icon"
                            />
                        )}
                        <span className={textClassName}>{partner.name}</span>
                    </Link>
                </div>
            )}
        </>
    );
}