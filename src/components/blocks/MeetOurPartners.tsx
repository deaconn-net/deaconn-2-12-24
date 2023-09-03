import { Partner } from "@prisma/client";

export default function MeetOurPartnersBlock ({
    partners
} : {
    partners?: Partner[]
}) {
    return (
        <>
            {partners && partners.length > 0 && (
                <div className="content-item2">
                    <div>
                        <h2>Meet Our Partners!</h2>
                    </div>
                    <div>
                        <p className="italic">Under construction...</p>
                    </div>
                </div>
            )}
        </>
    )
}