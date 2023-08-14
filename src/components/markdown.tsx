import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import DefaultTheme from "@utils/markdown/styles/default";

const Markdown: React.FC<{
    className?: string
    children: string
}> = ({
    className,
    children
}) => {
    return (
        <ReactMarkdown
            children={children}
            className={`markdown ${className ?? ""}`}
            components={{
                code({ node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || "");

                    return !inline && match ? (
                        <SyntaxHighlighter
                            {...props}
                            wrapLines={true}
                            showLineNumbers={true}
                            wrapLongLines={true}
                            children={String(children).replace(/\n$/, "")}
                            style={DefaultTheme}
                            language={match[1]}
                            PreTag="div"
                        />
                    ) : (
                        <code
                            {...props}
                            className={`markdown-code-line ${className}`}
                        >
                            {children}
                        </code>
                    )
                }
            }}
        />
    );
}

export default Markdown;