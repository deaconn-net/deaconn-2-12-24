import Link from "next/link";

import { type RequestWithService } from "~/types/request";

import { api } from "@utils/api";
import { dateFormat, dateFormatOne } from "@utils/date";

const Row: React.FC<{
    request: RequestWithService
}> = ({ request }) => {
    const viewUrl = "/request/view/" + request.id;
    const editUrl = "/request/new?id=" + request.id;

    const closeMut = api.request.close.useMutation();

    const createdAt = dateFormat(request.createdAt, dateFormatOne);
    const updatedAt = dateFormat(request.updatedAt, dateFormatOne);

    return (
        <tr className="request-row">
            <td className="request-row-data">
                {request.title && request.title}
            </td>
            <td className="request-row-data">
                {request.service ? request.service.name : "None"}
            </td>
            <td className="request-row-data">
                {createdAt ?? "Not Set"}
            </td>
            <td className="request-row-data">
                {updatedAt ?? "Not Set"}
            </td>
            <td className="request-row-data">
                {request.closed ? "Closed" : "Open"}
            </td>
            <td className="request-row-data">
                {request.accepted ? "Yes" : "No"}
            </td>
            <td className="request-row-data">
                <Link href={viewUrl} className="button">View</Link>
            </td>
        </tr>
    );
}

export default Row;