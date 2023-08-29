export default function DiscordWidget ({
    id,
    width = 350,
    height = 500,
    className
} : {
    id: string,
    width?: number | string | undefined,
    height?: number | string | undefined,
    className?: string
}) {
    return (
        <iframe
            src={`https://discord.com/widget?id=${id}&theme=dark`}
            width={width}
            height={height}
            className={className}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
    );
}