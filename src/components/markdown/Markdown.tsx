import { default as ReactMarkdown } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import DefaultTheme from "@components/markdown/styles/Default";

import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'

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
            className={`markdown ${className ?? ""}`}
            rehypePlugins={rehype ? [rehypeRaw] : undefined}
            components={{
                code(props) {
                    const { children, className, node, ...rest } = props;
                    
                    const match = /language-(\w+)/.exec(className || '')

                    return match ? (
                        <SyntaxHighlighter
                            wrapLines={true}
                            showLineNumbers={true}
                            wrapLongLines={true}
                            style={dark}
                            language={match[1]}
                            PreTag="div"
                        >
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ) : (
                        <code {...rest} className={className}>
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