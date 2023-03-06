import { type NextPage } from "next";
import { Deaconn } from '../components/main';

const Content: React.FC = () => {
  return (
    <div className="content">
      <div className="flex flex-wrap">
        <div className="content-col-large">
          <div className="w-full">
            <h3 className="text-white text-3xl font-bold italic">Popular Services</h3>
            <div>
              <p>Our services!</p>
            </div>
          </div>
          <div className="w-full">
            <h3 className="text-white text-3xl font-bold italic">Have A Request?</h3>
          </div>
          <div className="w-full">
            <h3 className="text-white text-3xl font-bold italic">Latest Articles</h3>
          </div>
        </div>
        <div className="content-col-small">
          <div className="w-full">
            <h3 className="text-white text-3xl font-bold italic">Our Team</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

const Page: NextPage = () => {
  return (
    <Deaconn 
      content={<Content />}
    />
  );
};

export default Page;