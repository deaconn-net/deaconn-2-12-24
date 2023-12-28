import Link from "next/link";

export default function WhoAreWeBlock () {
    const rootUserUrl = process.env.NEXT_PUBLIC_ROOT_USER_URL || "cdeacon";
    
    return (
        <div className="content-item2">
            <div>
                <h2>Who Are We?</h2>
            </div>
            <div>
                <p>
                    <span className="font-bold">Deaconn</span> is a community and future software developer with the goal to bring together and empower developers and engineers.
                </p>
                <p>
                    Deaconn, initially founded in 2021 as a personal portfolio for <Link href={`/user/view/${rootUserUrl}`}>Christian Deacon</Link>, underwent a complete overhaul in 2023. Its new mission is to create <span className="font-bold">open source</span> services, applications, and frameworks for the benefit of the community. Additionally, Deaconn features a rather unique blog with informative articles, providing users with valuable insights. Users can also showcase their projects, experiences, and skills, creating a dynamic platform akin to a personalized portfolio.  
                </p>
            </div>
        </div>
    );
}