import { NextPage } from "next";
import { Deaconn } from '../../../components/main';

const Content: React.FC = () => {
  return (
    <div className="container mx-auto py-16">
      <p className="text-white">Service View</p>
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