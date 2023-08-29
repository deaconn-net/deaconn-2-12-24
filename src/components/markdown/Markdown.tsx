import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import DefaultTheme from "@components/markdown/styles/Default";

export default function Markdown ({
    className,
    children
} : {
    className?: string
    children: string
}) {
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