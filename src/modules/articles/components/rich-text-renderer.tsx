import type { ReactNode } from "react";

import { isSafeLink, type TipTapDocument, type TipTapMark, type TipTapNode } from "../content";

export function RichTextRenderer({ content }: { content: TipTapDocument }) {
  return <div className="max-w-[62ch] text-[1.0625rem] leading-[1.85] text-text-secondary md:text-lg">{content.content.map((node, index) => renderNode(node, index))}</div>;
}

export function getRichTextHeadings(content: TipTapDocument) {
  return content.content.flatMap((node, index) => {
    if (node.type !== "heading") return [];
    const label = getNodeText(node).trim();
    return label ? [{ id: headingId(index), label, level: node.attrs?.level === 3 ? 3 : 2 }] : [];
  });
}

function renderNode(node: TipTapNode, key: number | string): ReactNode {
  const children = node.content?.map((child, index) => renderNode(child, `${key}-${index}`));
  switch (node.type) {
    case "text": return <span key={key}>{applyMarks(node.text ?? "", node.marks ?? [], key)}</span>;
    case "paragraph": return <p className="my-5" key={key}>{children}</p>;
    case "heading": return node.attrs?.level === 3 ? <h3 className="mb-4 mt-10 scroll-mt-28 text-2xl font-semibold leading-[1.45] text-foreground" id={typeof key === "number" ? headingId(key) : undefined} key={key}>{children}</h3> : <h2 className="mb-5 mt-14 scroll-mt-28 text-3xl font-bold leading-[1.35] text-foreground md:text-4xl" id={typeof key === "number" ? headingId(key) : undefined} key={key}>{children}</h2>;
    case "bulletList": return <ul className="my-6 list-disc space-y-2 pr-6" key={key}>{children}</ul>;
    case "orderedList": return <ol className="my-6 list-decimal space-y-2 pr-6" key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote className="my-9 border-y border-border py-6 text-xl font-medium leading-[1.8] text-clay-strong" key={key}>{children}</blockquote>;
    case "hardBreak": return <br key={key} />;
    default: return null;
  }
}

function applyMarks(text: string, marks: TipTapMark[], key: number | string): ReactNode {
  return marks.reduce<ReactNode>((value, mark, index) => {
    if (mark.type === "bold") return <strong key={`${key}-m${index}`}>{value}</strong>;
    if (mark.type === "italic") return <em key={`${key}-m${index}`}>{value}</em>;
    if (mark.type === "link" && mark.attrs?.href && isSafeLink(mark.attrs.href)) return <a className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary-hover" href={mark.attrs.href} key={`${key}-m${index}`} rel={mark.attrs.href.startsWith("http") ? "noopener noreferrer" : undefined}>{value}</a>;
    return value;
  }, text);
}

function headingId(index: number) {
  return `guide-section-${index + 1}`;
}

function getNodeText(node: TipTapNode): string {
  if (node.type === "text") return node.text ?? "";
  return node.content?.map(getNodeText).join("") ?? "";
}
