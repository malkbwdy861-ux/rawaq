"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

import { Input } from "@/components/ui/input";

import { isSafeLink, type TipTapDocument } from "../content";

const emptyDocument: TipTapDocument = { type: "doc", content: [{ type: "paragraph", content: [] }] };
const controlClass = "min-h-10 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[oklch(95.5%_0.018_145)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)] disabled:text-[oklch(53%_0.012_150)] aria-pressed:border-[oklch(37%_0.075_155)] aria-pressed:bg-[oklch(90%_0.035_150)]";

export function RichTextEditor({ defaultValue, error }: { defaultValue?: TipTapDocument | null; error?: string }) {
  const [content, setContent] = useState<TipTapDocument>(defaultValue ?? emptyDocument);
  const [linkHref, setLinkHref] = useState("");
  const [linkError, setLinkError] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [2, 3] },
        horizontalRule: false,
        link: { autolink: false, openOnClick: false, protocols: ["http", "https", "mailto", "tel"] },
        strike: false,
        underline: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "min-h-72 max-w-[72ch] px-4 py-4 text-base leading-[1.8] outline-none [&_blockquote]:border-y [&_blockquote]:border-[oklch(82%_0.012_145)] [&_blockquote]:py-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pr-6 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pr-6",
        "aria-label": "محتوى المقال",
        "aria-describedby": error ? "article-content-error" : "",
        "aria-invalid": error ? "true" : "false",
        id: "article-content",
      },
    },
    onUpdate: ({ editor: currentEditor }) => setContent(currentEditor.getJSON() as TipTapDocument),
  });

  function applyLink() {
    const href = linkHref.trim();
    if (!editor) return;
    if (!href) {
      setLinkError("");
      editor.chain().focus().unsetLink().run();
    } else if (!isSafeLink(href)) {
      setLinkError("استخدم رابطًا يبدأ بـ https:// أو http:// أو mailto: أو tel: أو /.");
    } else {
      setLinkError("");
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] focus-within:border-[oklch(37%_0.075_155)] focus-within:ring-2 focus-within:ring-[oklch(51%_0.09_155)] focus-within:ring-offset-2">
      <input name="content" type="hidden" value={JSON.stringify(content)} />
      <div aria-label="تنسيق المحتوى" className="flex flex-wrap gap-2 border-b border-[oklch(82%_0.012_145)] bg-[oklch(96.5%_0.009_120)] p-3" role="toolbar">
        <EditorButton active={editor?.isActive("heading", { level: 2 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>عنوان 2</EditorButton>
        <EditorButton active={editor?.isActive("heading", { level: 3 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>عنوان 3</EditorButton>
        <EditorButton active={editor?.isActive("bold")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()}>عريض</EditorButton>
        <EditorButton active={editor?.isActive("italic")} disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()}>مائل</EditorButton>
        <EditorButton active={editor?.isActive("bulletList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()}>قائمة نقطية</EditorButton>
        <EditorButton active={editor?.isActive("orderedList")} disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>قائمة رقمية</EditorButton>
        <EditorButton active={editor?.isActive("blockquote")} disabled={!editor} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>اقتباس</EditorButton>
        <div className="flex min-w-full gap-2 sm:min-w-0 sm:flex-1">
          <label className="sr-only" htmlFor="article-link">رابط النص المحدد</label>
          <Input aria-describedby={linkError ? "article-link-error" : undefined} aria-invalid={Boolean(linkError)} className="min-h-10 min-w-0 flex-1 rounded-[4px] border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] text-sm aria-invalid:border-[oklch(46%_0.16_28)]" dir="ltr" id="article-link" onChange={(event) => setLinkHref(event.target.value)} placeholder="https:// أو /guides/..." type="text" value={linkHref} />
          <button className={controlClass} disabled={!editor} onClick={applyLink} type="button">تطبيق الرابط</button>
        </div>
        {linkError ? <p className="min-w-full text-sm font-medium text-[oklch(46%_0.16_28)]" id="article-link-error">{linkError}</p> : null}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function EditorButton({ active, children, disabled, onClick }: { active?: boolean; children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return <button aria-pressed={active} className={controlClass} disabled={disabled} onClick={onClick} type="button">{children}</button>;
}
