import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserGeneralForm } from "./general";

export const UserSettingsPanel: React.FC<{ current?: string }> = ({ current="general" }) => {
    const { data: session } = useSession();

    return (
        <>
            {session && (
                <div className="flex flex-wrap">
                    <div className="w-full sm:w-1/12">
                        <ul className="list-none">
                            <Link href="/user/profile">
                                <li className={"profile-item" + ((current == "general") ? " !bg-cyan-800" : "")}>General</li>
                            </Link>
                            <Link href="/user/profile/experiences">
                                <li className={"profile-item" + ((current == "experiences") ? " !bg-cyan-800" : "")}>Experiences</li>
                            </Link>
                            <Link href="/user/profile/skills">
                                <li className={"profile-item" + ((current == "skills") ? " !bg-cyan-800" : "")}>Skills</li>
                            </Link>
                            <Link href="/user/profile/projects">
                                <li className={"profile-item" + ((current == "projects") ? " !bg-cyan-800" : "")}>Projects</li>
                            </Link>
                        </ul>
                    </div>

                    <div className="w-full sm:w-11/12">
                        {current == "general" && (
                            <UserGeneralForm />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}