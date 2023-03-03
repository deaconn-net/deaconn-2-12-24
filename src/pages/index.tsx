import { type NextPage } from "next";

import { Deaconn } from '../components/main';

const Home: NextPage = () => {
  return (
    <Deaconn 
      content={<Content />}
    />
  );
};

const Content: React.FC = () => {
  return (
    <div className="container">
      <p>Hello!</p>
    </div>
  )
}

export default Home;
