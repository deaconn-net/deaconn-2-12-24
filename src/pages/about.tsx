import { type NextPage } from "next";
import { Deaconn } from '../components/main';

const Content: React.FC = () => {
    return (
        <div className="content">
            <p className="text-white">About</p>
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