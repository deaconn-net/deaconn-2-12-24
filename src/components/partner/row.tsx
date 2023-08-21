import Image from "next/image";
import Link from "next/link";

import { type Partner } from "@prisma/client";

const PartnerRow: React.FC<{
    partner: Partner
}> = ({
    partner
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const upload_url = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";
    const banner = cdn + upload_url + (partner?.banner ?? "");

    return (
        <Link
            href={`https://${partner.url}`}
            target="_blank"
        >
            <div className="partner-row">
                {partner.banner ? (
                    <Image
                        src={banner}
                        width={300}
                        height={300}
                        alt={partner.name}
                    />
                ) : (
                    <span>{partner.name}</span>
                )}
            </div>
        </Link>
    );
}

export default PartnerRow;