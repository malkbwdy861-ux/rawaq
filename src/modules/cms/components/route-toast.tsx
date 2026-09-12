"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export function CmsRouteToast({ success, error, cleanHref }: { success?: string; error?: string; cleanHref: string }) {
  const router = useRouter();

  useEffect(() => {
    if (success) toast.success(success, { toastId: `cms-success-${success}` });
    if (error) toast.error(error, { toastId: `cms-error-${error}` });
    if (success || error) router.replace(cleanHref, { scroll: false });
  }, [cleanHref, error, router, success]);

  return null;
}
