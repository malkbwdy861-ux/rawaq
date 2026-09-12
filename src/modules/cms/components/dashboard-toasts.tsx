"use client";

import { ToastContainer } from "react-toastify";

export function DashboardToasts() {
  return (
    <ToastContainer
      autoClose={4500}
      closeOnClick
      newestOnTop
      pauseOnFocusLoss
      position="top-left"
      rtl
      theme="light"
      toastClassName="!rounded-xl !border !border-border !bg-card !font-sans !text-sm !text-foreground !shadow-[var(--shadow-float)]"
    />
  );
}
