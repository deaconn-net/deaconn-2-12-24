import Link from "next/link";

export default function HaveARequestBlock () {
    return (
        <div className="content-item2">
            <div>
                <h2>Have A Request?</h2>
            </div>
            <div>
                <p>If you have an issue or want to suggest a new service for Deaconn, feel free to create a request! We'll most likely be open to freelance requests in the future.</p>
                <p><span className="font-bold">Please note</span> that we cannot guarantee the acceptance of every request. After you submit a request, we will be able to communicate back and forth on details such as payment and time frame.</p>
                <div className="flex py-6">
                    <Link href="/request/new" className="button">New Request</Link>
                </div>
            </div>
        </div>
    );
}