import { default as ReactMarkdown } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import DefaultTheme from "@components/markdown/styles/Default";

import rehypeRaw from "rehype-raw";

export default function Markdown ({
    className,
    rehype,
    children
} : {
    className?: string,
    rehype?: boolean,
    children: string
}) { 
    return (
        <ReactMarkdown
            children={children}
            className={`markdown ${className ?? ""}`}
            rehypePlugins={rehype ? [rehypeRaw] : undefined}
            components={{
                code(props) {
                    const { children, className, node, ...rest } = props;
                    
                    const match = /language-(\w+)/.exec(className || '')

                    console.log(className);

                    return match ? (
                        <SyntaxHighlighter
                            children={String(children).replace(/\n$/, "")}
                            wrapLines={true}
                            showLineNumbers={true}
                            wrapLongLines={true}
                            style={DefaultTheme}
                            language={match?.[1]}
                            PreTag="div"
                        />
                    ) : (
                        <code {...rest} className={`markdown-code-inline ${className ?? ""}`}>
                            {children}
                        </code>
                    )
                }
            }}
        />
    );
}