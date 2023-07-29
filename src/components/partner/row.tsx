import { type Partner } from "@prisma/client";

const Row: React.FC<{
    partner: Partner
}> = ({
    partner
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const banner = (partner.banner) ? cdn + partner.banner : null;

    return (
        <a href={partner.url} target="_blank">
            <div className="partner-row">
                {banner ? (
                    <img src={banner} className="w-full h-18" alt={partner.name} />
                ) : (
                    <span className="text-lg text-white">{partner.name}</span>
                )}
            </div>
        </a>
    );
}

export default Row;