import Link from "next/link";

import { absoluteUrl } from "../site-url";
import { JsonLd } from "./json-ld";

type BreadcrumbItem = { label: string; href: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const structuredItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: absoluteUrl(item.href),
  }));

  return <>
    <nav aria-label="مسار التنقل" className="text-sm text-[oklch(42%_0.018_150)]">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
          {index ? <span aria-hidden="true">‹</span> : null}
          {index < items.length - 1 ? <Link className="font-semibold underline" href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </li>)}
      </ol>
    </nav>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: structuredItems }} />
  </>;
}
