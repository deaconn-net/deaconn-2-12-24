import { User } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { ExperienceBrowser } from "~/components/user/experience/browser";
import { ProjectBrowser } from "~/components/user/project/browser";
import { SkillBrowser } from "~/components/user/skill/browser";
import { prisma } from "~/server/db";

import { Deaconn } from '../../../components/main';

import { dateFormat, dateFormatTwo } from "~/utils/date";

const Content: React.FC<{ user: User, current?: string }> = ({ user, current="general" }) => {
  const baseUrl = "/user/view/" + ((user.url) ? user.url : user.id);

  if (!current)
    current = "general";

  const birthday = (user.birthday) ? dateFormat(user.birthday, dateFormatTwo) : null;

  return (
    <div className="content">
      {user ? (
        <div className="flex flex-wrap">
            <div className="w-full sm:w-1/12">
                <div className="pb-6 flex flex-col items-center justify-center">
                  {user.image && (
                    <img src={user.image} className="w-20 h-20" />
                  )}
                  {user.title && (
                    <p className="text-lg font-bold text-white">{user.title}</p>
                  )}
                  {user.name && (
                    <p>{user.name}</p>
                  )}
                </div>
                <ul className="list-none">
                    <Link href={baseUrl}>
                        <li className={"profile-item" + ((current == "general") ? " !bg-cyan-800" : "")}>General</li>
                    </Link>
                    <Link href={baseUrl + "/experiences"}>
                        <li className={"profile-item" + ((current == "experiences") ? " !bg-cyan-800" : "")}>Experiences</li>
                    </Link>
                    <Link href={baseUrl + "/skills"}>
                        <li className={"profile-item" + ((current == "skills") ? " !bg-cyan-800" : "")}>Skills</li>
                    </Link>
                    <Link href={baseUrl + "/projects"}>
                        <li className={"profile-item" + ((current == "projects") ? " !bg-cyan-800" : "")}>Projects</li>
                    </Link>
                </ul>
            </div>

            <div className="w-full sm:w-11/12">
                {current == "general" && (
                    <>
                      {user.aboutMe && (
                        <div className="p-6">
                          <h3 className="content-title">About Me</h3>
                          <ReactMarkdown
                            className="markdown"
                          >{user.aboutMe}</ReactMarkdown>
                        </div>
                      )}
                      {user.showEmail && user.email && (
                        <div className="p-6">
                          <h3 className="content-title">Email</h3>
                          <p className="italic">{user.email}</p>
                        </div>
                      )}
                      {birthday && (
                        <div className="p-6">
                          <h3 className="content-title">Birthday</h3>
                          <p className="italic">{birthday}</p>
                        </div>
                      )}
                    </>
                )}
                {current == "experiences" && (
                  <div className="p-6">
                      <h1 className="content-title">Experiences</h1>
                      <ExperienceBrowser
                        userId={user.id}
                      />
                  </div>
                )}
                {current == "skills" && (
                  <div className="p-6">
                    <h1 className="content-title">Skills</h1>
                    <SkillBrowser
                      userId={user.id ?? null}                       
                    />
                  </div>
                )}
                {current == "projects" && (
                  <div className="p-6">
                    <h1 className="content-title">Projects</h1>
                    <ProjectBrowser
                        userId={user.id ?? null}                       
                    />
                  </div>
                )}
            </div>
        </div>
      ) : (
        <p className="text-white">User not found!</p>
      )}
      
    </div>
  )
}

const Page: NextPage<{ user: User, current?: string }> = ({ user, current }) => {
  return (
    <Deaconn 
      content={<Content 
        user={user}
        current={current}
      />}
    />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const search = (ctx?.params?.user) ? ctx.params.user[0] ?? null : null;
  const current = (ctx?.params?.user) ? ctx.params.user[1] ?? null : null;

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

  return { props: { user: JSON.parse(JSON.stringify(user)), current: current } };
}


export default Page;