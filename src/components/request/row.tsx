import { Request } from "@prisma/client";
import Link from "next/link";
import { api } from "~/utils/api";

export const RequestRow: React.FC<{ request: Request }> = ({ request }) => {
    const viewUrl = "/request/view/" + request.id;
    const editUrl = "/request/new?id=" + request.id;

    const closeMut = api.request.close.useMutation();
  
    return (
        <tr className="request-row">
            <td className="request-cData">
                {request.title && (
                    <h3 className="text-white text-2xl font-bold text-center">{request.title}</h3>
                )}
            </td>
            <td className="request-cData">
                {request.createdAt.toString()}
            </td>
            <td className="request-cData">
                {request.updatedAt.toString()}
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