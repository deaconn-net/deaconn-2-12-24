import Markdown from "@components/markdown/Markdown";
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
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {partner.icon && (
                                            <Image
                                                src={uploadsUrl + partner.icon}
                                                width={32}
                                                height={32}
                                                alt="Partner Icon"
                                            />
                                        )}
                                        <h4 className="not-italic">
                                            <Link
                                                href={`https://${partner.url}`}
                                                target="_blank"
                                            >{partner.name}</Link>
                                        </h4>
                                    </div>
                                    <div>
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