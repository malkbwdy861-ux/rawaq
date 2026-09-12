import { prisma } from "@/server/db/prisma";
import { readServedMediaFile } from "@/modules/media/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const file = await readServedMediaFile(path);
  if (!file) return new Response(null, { status: 404 });

  const media = await prisma.media.findFirst({
    where: { url: `/uploads/${path.join("/")}` },
    select: { mimeType: true, sizeBytes: true },
  });
  if (!media) return new Response(null, { status: 404 });

  return new Response(file, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(media.sizeBytes),
      "Content-Type": media.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
