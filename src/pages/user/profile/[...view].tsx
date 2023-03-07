import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Deaconn } from '../../../components/main';

import { useRouter } from "next/router";
import { UserSettingsPanel } from "~/components/forms/user/settings_panel";

const Content: React.FC = () => {
    const { data: session } = useSession();
    
    const router = useRouter();

    console.log("Query");
    console.log(router.query);

    const { view } = router.query;

    let realView = (view) ? view[0] ?? "general" : "general";

    if (!["general", "experiences", "skills", "projects"].includes(realView))
        realView = "general";

    return (
        <div className="content">
            <UserSettingsPanel
                current={realView}
            />
        </div>
    )
}

const Page: NextPage = () => {
  return (
    <Deaconn 
      content={<Content />}
    />
  );
};

export default Page;