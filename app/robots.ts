import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/modules/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/preview/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
