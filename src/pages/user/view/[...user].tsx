import { User } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import { prisma } from "~/server/db";

import { Deaconn } from '../../../components/main';

const Content: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="content">
      {user ? (
        <p>User found! User - {user.name}</p>
      ) : (
        <p className="text-white">User not found!</p>
      )}
      
    </div>
  )
}

const Page: NextPage<{ user: User }> = ({ user }) => {
  return (
    <Deaconn 
      content={<Content 
        user={user}
      />}
    />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const search = (ctx?.params?.user) ? ctx.params.user[0] ?? null : null;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          ...(search && {
            id: search
          })
        },
        {
          ...(search && {
            url: search
          })
        }
      ]
    }
  });

  return { props: { user: user } };
}


export default Page;