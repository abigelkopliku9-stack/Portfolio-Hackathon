"use client";
import { useState } from "react";
export function usePdfDownload() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  async function download(slug: string) {
    setStatus("loading"); setError("");
    try {
      const response = await fetch(`/api/portfolios/${encodeURIComponent(slug)}/export/pdf`);
      if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Your PDF couldn’t be downloaded. Please try again.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `${slug}-cv.pdf`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setStatus("success");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setStatus("error"); }
  }
  return { download, status, error };
}
