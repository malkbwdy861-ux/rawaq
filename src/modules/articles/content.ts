export type TipTapMark = {
  type: "bold" | "italic" | "link";
  attrs?: { href?: string };
};

export type TipTapNode = {
  type: "doc" | "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem" | "blockquote" | "hardBreak" | "text";
  attrs?: { level?: number };
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
};

export type TipTapDocument = TipTapNode & { type: "doc"; content: TipTapNode[] };

const containerTypes = new Set(["doc", "paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote"]);
const nodeTypes = new Set([...containerTypes, "hardBreak", "text"]);
const markTypes = new Set(["bold", "italic", "link"]);

export function isTipTapDocument(value: unknown): value is TipTapDocument {
  return isRecord(value) && value.type === "doc" && Array.isArray(value.content) && value.content.every((node) => isTipTapNode(node, 0));
}

export function tipTapDocumentHasText(document: TipTapDocument) {
  return document.content.some(nodeHasText);
}

function isTipTapNode(value: unknown, depth: number): value is TipTapNode {
  if (depth > 30 || !isRecord(value) || typeof value.type !== "string" || !nodeTypes.has(value.type)) return false;
  if (value.type === "text") {
    return typeof value.text === "string" && isValidMarks(value.marks);
  }
  if (value.type === "hardBreak") return value.content === undefined && isValidMarks(value.marks);
  if (!containerTypes.has(value.type) || (value.content !== undefined && !Array.isArray(value.content))) return false;
  if (value.type === "heading" && (!isRecord(value.attrs) || ![2, 3].includes(Number(value.attrs.level)))) return false;
  return value.content === undefined || value.content.every((node) => isTipTapNode(node, depth + 1));
}

function isValidMarks(value: unknown) {
  if (value === undefined) return true;
  if (!Array.isArray(value)) return false;
  return value.every((mark) => {
    if (!isRecord(mark) || typeof mark.type !== "string" || !markTypes.has(mark.type)) return false;
    if (mark.type !== "link") return true;
    if (!isRecord(mark.attrs) || typeof mark.attrs.href !== "string") return false;
    return isSafeLink(mark.attrs.href);
  });
}

function nodeHasText(node: TipTapNode): boolean {
  if (node.type === "text") return Boolean(node.text?.trim());
  return node.content?.some(nodeHasText) ?? false;
}

export function isSafeLink(href: string) {
  const value = href.trim();
  return value.startsWith("/") || /^(https?:|mailto:|tel:)/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
