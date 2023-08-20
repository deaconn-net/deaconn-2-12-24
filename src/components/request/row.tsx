import Link from "next/link";

import { type RequestWithService } from "~/types/request";

//import { api } from "@utils/api";
import { dateFormat, dateFormatOne } from "@utils/date";

const RequestRow: React.FC<{
    request: RequestWithService
}> = ({ request }) => {
    const viewUrl = "/request/view/" + request.id.toString();
    //const editUrl = "/request/new?id=" + request.id.toString();

    //const closeMut = api.request.close.useMutation();

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
                {request.status == 0 && (
                    <>Open</>
                )}
                {request.status == 1 && (
                    <>Pending</>
                )}
                {request.status == 2 && (
                    <>Completed</>
                )}
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

export default RequestRow;