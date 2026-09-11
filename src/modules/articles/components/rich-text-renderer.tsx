import type { ReactNode } from "react";

import { isSafeLink, type TipTapDocument, type TipTapMark, type TipTapNode } from "../content";

export function RichTextRenderer({ content }: { content: TipTapDocument }) {
  return <div className="max-w-[62ch] text-[1.0625rem] leading-[1.8] text-[oklch(42%_0.018_150)] md:text-lg">{content.content.map((node, index) => renderNode(node, index))}</div>;
}

function renderNode(node: TipTapNode, key: number | string): ReactNode {
  const children = node.content?.map((child, index) => renderNode(child, `${key}-${index}`));
  switch (node.type) {
    case "text": return <span key={key}>{applyMarks(node.text ?? "", node.marks ?? [], key)}</span>;
    case "paragraph": return <p className="my-5" key={key}>{children}</p>;
    case "heading": return node.attrs?.level === 3 ? <h3 className="mb-4 mt-10 text-2xl font-semibold leading-[1.45] text-[oklch(22%_0.018_155)]" key={key}>{children}</h3> : <h2 className="mb-5 mt-12 text-3xl font-bold leading-[1.35] text-[oklch(22%_0.018_155)] md:text-4xl" key={key}>{children}</h2>;
    case "bulletList": return <ul className="my-6 list-disc space-y-2 pr-6" key={key}>{children}</ul>;
    case "orderedList": return <ol className="my-6 list-decimal space-y-2 pr-6" key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote className="my-8 border-y border-[oklch(82%_0.012_145)] py-5 text-xl leading-[1.8] text-[oklch(34%_0.065_42)]" key={key}>{children}</blockquote>;
    case "hardBreak": return <br key={key} />;
    default: return null;
  }
}

function applyMarks(text: string, marks: TipTapMark[], key: number | string): ReactNode {
  return marks.reduce<ReactNode>((value, mark, index) => {
    if (mark.type === "bold") return <strong key={`${key}-m${index}`}>{value}</strong>;
    if (mark.type === "italic") return <em key={`${key}-m${index}`}>{value}</em>;
    if (mark.type === "link" && mark.attrs?.href && isSafeLink(mark.attrs.href)) return <a className="font-medium text-[oklch(37%_0.075_155)] underline underline-offset-4" href={mark.attrs.href} key={`${key}-m${index}`} rel={mark.attrs.href.startsWith("http") ? "noopener noreferrer" : undefined}>{value}</a>;
    return value;
  }, text);
}
