import IconAndText from "./containers/icon_and_text";
import LoadingIcon from "./icons/loading";

const Loader: React.FC = () => {
    return (
        <div className="w-full flex justify-center">
            <IconAndText
                icon={
                    <LoadingIcon
                        classes={[
                            "w-8",
                            "h-8",
                            "mr-2",
                            "animate-spin",
                            "fill-blue-600"
                        ]}
                    />
                }
                text={<>Loading...</>}
            />
        </div>
    );
}

export default Loader;