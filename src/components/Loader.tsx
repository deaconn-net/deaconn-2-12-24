import IconAndText from "./containers/IconAndText";
import LoadingIcon from "./icons/Loading";

export default function Loader () {
    return (
        <div className="w-full flex justify-center">
            <IconAndText
                icon={
                    <LoadingIcon
                        className="w-8 h-8 mr-2 animate-spin fill-blue-600"
                    />
                }
                text={<>Loading...</>}
            />
        </div>
    );
}