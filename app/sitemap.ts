import { ContentStatus } from "@prisma/client";
import type { MetadataRoute } from "next";

import { cmsContentPath } from "@/modules/cms/slugs";
import { pageDefinitions } from "@/modules/pages/queries";
import { absoluteUrl } from "@/modules/seo/site-url";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = { status: ContentStatus.PUBLISHED, publishedVersionId: { not: null } } as const;
  const [services, solutions, materials, projects, articles, pages, redirects] = await Promise.all([
    prisma.service.findMany({ where: published, select: sitemapSelect }),
    prisma.solution.findMany({ where: published, select: sitemapSelect }),
    prisma.material.findMany({ where: published, select: sitemapSelect }),
    prisma.project.findMany({ where: published, select: sitemapSelect }),
    prisma.article.findMany({ where: published, select: sitemapSelect }),
    prisma.page.findMany({ where: published, select: { key: true, updatedAt: true, publishedVersion: { select: { noIndex: true } } } }),
    prisma.redirect.findMany({ select: { sourcePath: true } }),
  ]);
  const redirected = new Set(redirects.map((item) => item.sourcePath));
  const entries: MetadataRoute.Sitemap = ["/materials", "/guides"]
    .filter((path) => !redirected.has(path))
    .map((path) => ({ url: absoluteUrl(path) }));

  for (const page of pages) {
    const definition = pageDefinitions.find((item) => item.key === page.key);
    if (definition && !page.publishedVersion?.noIndex && !redirected.has(definition.path)) entries.push({ url: absoluteUrl(definition.path), lastModified: page.updatedAt });
  }

  addEntities(entries, services, "/services", redirected);
  addEntities(entries, solutions, "/solutions", redirected);
  addEntities(entries, materials, "/materials", redirected);
  addEntities(entries, projects, "/projects", redirected);
  addEntities(entries, articles, "/guides", redirected);
  return entries;
}

const sitemapSelect = { publishedAt: true, updatedAt: true, publishedVersion: { select: { slug: true, noIndex: true, updatedAt: true } } } as const;

type SitemapEntity = { publishedAt: Date | null; updatedAt: Date; publishedVersion: { slug: string | null; noIndex: boolean; updatedAt: Date } | null };
function addEntities(entries: MetadataRoute.Sitemap, entities: SitemapEntity[], prefix: string, redirected: Set<string>) {
  for (const entity of entities) {
    const version = entity.publishedVersion;
    if (!version?.slug || version.noIndex) continue;
    const path = cmsContentPath(prefix, version.slug);
    if (!redirected.has(path)) entries.push({ url: absoluteUrl(path), lastModified: version.updatedAt });
  }
}
