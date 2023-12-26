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
        <div className={`flex items-center gap-1 ${!inline ? "flex-col" : ""} ${className ?? ""}`}>
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    );
}