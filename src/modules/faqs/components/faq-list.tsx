export type PublicFaq = { id: string; question: string | null; answer: string | null };

export function FaqList({ items }: { items: PublicFaq[] }) {
  const visible = items.filter((item) => item.question && item.answer);
  if (!visible.length) return null;
  return <div className="divide-y divide-[oklch(82%_0.012_145)] border-y border-[oklch(82%_0.012_145)]">
    {visible.map((item) => <details className="group py-3" key={item.id}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)] [&::-webkit-details-marker]:hidden"><span>{item.question}</span><span aria-hidden="true" className="text-[oklch(37%_0.075_155)] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">+</span></summary>
      <p className="max-w-[72ch] whitespace-pre-line pb-4 pt-2 leading-[1.8] text-[oklch(42%_0.018_150)]">{item.answer}</p>
    </details>)}
  </div>;
}
