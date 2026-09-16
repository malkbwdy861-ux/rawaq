import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/server/auth";
import {
  MediaUploadError,
  storeUploadedMedia,
} from "@/modules/media/upload";

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return Response.json(
      { message: "انتهت جلسة تسجيل الدخول. سجل الدخول وحاول مرة أخرى." },
      { status: 401 },
    );
  }

  try {
    const uploadedCount = await storeUploadedMedia(await request.formData());
    const message =
      uploadedCount === 1
        ? "تم رفع الصورة وحفظ بياناتها."
        : `تم رفع ${uploadedCount.toLocaleString("ar-SA")} صور وحفظ بياناتها.`;

    revalidatePath("/dashboard/media");
    return Response.json({ message });
  } catch (error) {
    if (error instanceof MediaUploadError) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    console.error("Media upload failed", error);
    return Response.json(
      { message: "تعذر رفع الصور. حاول مرة أخرى." },
      { status: 500 },
    );
  }
}
