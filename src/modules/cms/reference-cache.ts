import { revalidatePath } from "next/cache";

export function revalidateCmsReferenceConsumers() {
  revalidatePath("/dashboard/pages");
  revalidatePath("/", "layout");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/solutions/[slug]", "page");
  revalidatePath("/materials/[slug]", "page");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/guides/[slug]", "page");
}
