export default function IconAndText ({
    icon,
    text,
    className,
    inline
} : {
    icon: JSX.Element,
    text: JSX.Element,
    className?: string,
    inline?: boolean
}) {
    return (
        <div className={`container-icon-and-text ${!inline ? "flex-col" : ""} ${className ?? ""}`}>
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
}