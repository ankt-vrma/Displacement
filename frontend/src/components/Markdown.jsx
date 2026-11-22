import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  table: ({ node, ...props }) => (
    <div className="my-5 overflow-x-auto">
      <table {...props} />
    </div>
  ),
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
};

export default function Markdown({ children, className = "" }) {
  return (
    <div className={`plan-prose ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** The page already shows the trip title, so drop the plan's leading "# Trip: …" line. */
export const stripTitle = (md = "") => md.replace(/^\s*# .*\n+/, "");