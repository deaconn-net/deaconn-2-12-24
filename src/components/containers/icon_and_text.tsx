const IconAndText: React.FC<{
    icon: JSX.Element,
    text: JSX.Element,
    classes?: string[],
    inline?: boolean
}> = ({
    icon,
    text,
    classes,
    inline
}) => {
    return (
        <div className={`container-icon-and-text ${!inline ? "flex-col" : ""} ${classes?.join(" ") ?? ""}`}>
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
}

export default IconAndText;