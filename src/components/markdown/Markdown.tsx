import { type PluggableList, ReactMarkdown } from "react-markdown/lib/react-markdown";
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
            className={`markdown ${className ?? ""}`}
            rehypePlugins={rehype ? [rehypeRaw] as PluggableList : undefined}
        >
            {children}
        </ReactMarkdown>
    );
}