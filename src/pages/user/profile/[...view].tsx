import { GetServerSidePropsContext, NextPage } from "next";
import { useSession } from "next-auth/react";
import { Deaconn } from '../../../components/main';

import { useRouter } from "next/router";
import { UserSettingsPanel } from "~/components/forms/user/settings_panel";

const Content: React.FC<{ lookupId: number | null }> = ({ lookupId }) => {
    const { data: session } = useSession();
    
    const router = useRouter();

    const { view } = router.query;

    let realView = (view) ? view[0] ?? "general" : "general";

    if (!["general", "experiences", "skills", "projects"].includes(realView))
        realView = "general";

    return (
      <div className="content">
        <UserSettingsPanel
          lookupId={lookupId ?? 0}
          current={realView}
        />
      </div>
    )
}

const Page: NextPage<{ lookupId: number }> = ({ lookupId }) => {
  return (
    <Deaconn 
      content={<Content 
        lookupId={lookupId}
      />}
    />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const lookupId = (ctx.query.id) ? Number(ctx.query.id) : null;

  return { props: { lookupId: lookupId } };
}

export default Page;