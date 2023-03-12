import { NextPage } from "next";
import { Deaconn } from '../../../components/main';

import { UserSettingsPanel } from "~/components/forms/user/settings_panel";

const Content: React.FC = () => {
    return (
        <div className="content">
            <UserSettingsPanel />
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