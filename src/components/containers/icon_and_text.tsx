export default function IconAndText ({
    icon,
    text,
    classes,
    inline
} : {
    icon: JSX.Element,
    text: JSX.Element,
    classes?: string[],
    inline?: boolean
}) {
    return (
        <div className={`container-icon-and-text ${!inline ? "flex-col" : ""} ${classes?.join(" ") ?? ""}`}>
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
}