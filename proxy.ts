import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/server/db/prisma";
import { normalizeRedirectPath } from "@/modules/redirects/validation";

export async function proxy(request: NextRequest) {
  const redirect = await prisma.redirect.findUnique({
    where: { sourcePath: normalizeRedirectPath(request.nextUrl.pathname) },
    select: { destinationPath: true, statusCode: true },
  });

  if (!redirect) return NextResponse.next();
  return NextResponse.redirect(new URL(redirect.destinationPath, request.url), redirect.statusCode);
}

export const config = {
  matcher: ["/((?!api|dashboard|preview|media|_next|.*\\..*).*)"],
};
