import Link from "next/link";

import { type RequestWithService } from "~/types/request";

//import { api } from "@utils/Api";
import { dateFormat, dateFormatOne } from "@utils/Date";

export default function RequestRow ({
    request
} : {
    request: RequestWithService
}) {
    const viewUrl = "/request/view/" + request.id.toString();
    //const editUrl = "/request/new?id=" + request.id.toString();

    //const closeMut = api.request.close.useMutation();

    const createdAt = dateFormat(request.createdAt, dateFormatOne);
    const updatedAt = dateFormat(request.updatedAt, dateFormatOne);

    return (
        <tr className="w-full bg-cyan-900 hover:bg-cyan-800 border-gray-800 border-2 border-solid">
            <td className="p-6">
                {request.title && request.title}
            </td>
            <td className="p-6">
                {request.service ? request.service.name : "None"}
            </td>
            <td className="p-6">
                {createdAt ?? "Not Set"}
            </td>
            <td className="p-6">
                {updatedAt ?? "Not Set"}
            </td>
            <td className="p-6">
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
            <td className="p-6">
                {request.accepted ? "Yes" : "No"}
            </td>
            <td className="p-6">
                <Link href={viewUrl} className="button">View</Link>
            </td>
        </tr>
    );
}