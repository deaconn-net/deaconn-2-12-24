export default function DiscordServer ({
    id,
    width = 350,
    height = 500
} : {
    id: string,
    width?: number,
    height?: number
}) {
    return (
        <iframe
            src={`https://discord.com/widget?id=${id}&theme=dark`}
            width={width}
            height={height}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
    );
}