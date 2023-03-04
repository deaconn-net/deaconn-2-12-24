import { NextPage } from "next";
import { Deaconn } from '../../components/main';

import { CreateArticle } from '../../components/forms/blog/create_article';

const Content: React.FC = () => {
  return (
    <div className="content">
      <h1 className="text-3xl text-white font-bold italic">Create Article</h1>
      <CreateArticle />
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