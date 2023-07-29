import { type Partner } from "@prisma/client";

const Row: React.FC<{
    partner: Partner
}> = ({
    partner
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const upload_url = process.env.NEXT_PUBLIC_UPLOADS_PRE_URL ?? "";
    const banner = cdn + upload_url + partner?.banner;

    return (
        <a href={partner.url} target="_blank">
            <div className="partner-row">
                {partner.banner ? (
                    <img src={banner} className="w-full h-18" alt={partner.name} />
                ) : (
                    <span className="text-lg text-white">{partner.name}</span>
                )}
            </div>
        </a>
    );
}

export default Row;