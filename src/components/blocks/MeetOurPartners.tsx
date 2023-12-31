import Markdown from "@components/markdown/Markdown";
import PartnerRow from "@components/partner/Row";
import { type Partner } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export default function MeetOurPartnersBlock ({
    partners = []
} : {
    partners?: Partner[]
}) {
    const uploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";

    return (
        <>
            {partners.length > 0 && (
                <div className="content-item2">
                    <div>
                        <h2>Meet Our Partners!</h2>
                    </div>
                    <div>
                        {partners.map((partner, index) => {
                            return (
                                <div
                                    key={`partner-${index.toString()}`}
                                    className="p-2"
                                >
                                    <PartnerRow
                                        partner={partner}
                                        showBanner={false}
                                        showInline={true}
                                        textClassName="font-bold text-white text-xl"
                                    />
                                    <div className="p-2">
                                        {partner.about ? (
                                            <Markdown>
                                                {partner.about}
                                            </Markdown>
                                        ) : (
                                            <p className="italic">No information provided...</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    )
}