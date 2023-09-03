import DiscordWidget from "@components/DiscordWidget";

export default function DiscordServerBlock() {
    const discordServerId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID || undefined;
    
    return (
        <>
            {discordServerId && (
                <div className="content-item2">
                    <div>
                        <h2>Our Discord Server!</h2>
                    </div>
                    <div className="flex justify-center">
                        <DiscordWidget
                            id={discordServerId}
                            className="max-w-full w-full"
                            width="auto"
                        />
                    </div>
                </div>
            )}
        </>
    );
}