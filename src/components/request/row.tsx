import { Request } from "@prisma/client";
import Link from "next/link";
import { api } from "~/utils/api";

import { dateFormat, dateFormatOne } from "~/utils/date";

export const RequestRow: React.FC<{ request: Request }> = ({ request }) => {
    const viewUrl = "/request/view/" + request.id;
    const editUrl = "/request/new?id=" + request.id;

    const closeMut = api.request.close.useMutation();

    const createdAt = dateFormat(request.createdAt, dateFormatOne);
    const updatedAt = dateFormat(request.updatedAt, dateFormatOne);

    return (
        <tr className="request-row">
            <td className="request-cData">
                {request.title && request.title}
            </td>
            <td className="request-cData">
                {request.service ? request.service.name : "None"}
            </td>
            <td className="request-cData">
                {createdAt ?? "Not Set"}
            </td>
            <td className="request-cData">
                {updatedAt ?? "Not Set"}
            </td>
            <td className="request-cData">
                {request.closed ? "Closed" : "Open"}
            </td>
            <td className="request-cData">
                {request.accepted ? "Yes" : "No"}
            </td>
            <td className="request-cData">
                <Link href={viewUrl} className="button">View</Link>
            </td>
        </tr>
    );
}