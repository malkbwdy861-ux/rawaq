import Link from "next/link";

import { absoluteUrl } from "../site-url";
import { JsonLd } from "./json-ld";

type BreadcrumbItem = { label: string; href: string };

export function Breadcrumbs({ items, className = "text-text-secondary" }: { items: BreadcrumbItem[]; className?: string }) {
  const structuredItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: absoluteUrl(item.href),
  }));

  return <>
    <nav aria-label="مسار التنقل" className={`text-sm ${className}`}>
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
