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
            className={`markdown ${className ?? ""}`}
            components={{
                code({ inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || "");

                    return !inline ? (
                        <SyntaxHighlighter
                            {...props}
                            wrapLines={true}
                            showLineNumbers={true}
                            wrapLongLines={true}
                            style={DefaultTheme}
                            language={match?.[1]}
                            PreTag="div"
                        >
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ) : (
                        <code
                            {...props}
                            className={`markdown-code-inline ${className ?? ""}`}                        
                        >
                            {children}
                        </code>
                    )
                }
            }}
        >
            {children}
        </ReactMarkdown>
    );
}

export default Markdown;