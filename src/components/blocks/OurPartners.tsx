import { type Partner } from "@prisma/client";

import PartnerRow from "@components/partner/Row";


export default function OurPartnersBlock({
    partners  
} : {
    partners?: Partner[]
}) {
    return (
        <>
            {partners && partners.length > 0 && (
                <div className="content-item2">
                    <div>
                        <h2>Our Partners</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {partners?.map((partner) => {
                            return (
                                <PartnerRow
                                    key={"partner-" + partner.id.toString()}
                                    partner={partner}
                                    showInline={true}
                                    bannerWidth={undefined}
                                    bannerHeight={undefined}
                                    bannerClassName="partner-row-banner"
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}