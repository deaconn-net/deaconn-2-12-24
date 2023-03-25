import { Partner } from "@prisma/client";

export const PartnerRow: React.FC<{ partner: Partner, cdn: string }> = ({ partner, cdn }) => {
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