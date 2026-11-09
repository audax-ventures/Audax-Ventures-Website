"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Draws the report PDF as images inside the page with pdf.js, so it can
 * refresh after every save without flashing or jumping back to the top
 * (which a browser's built-in PDF viewer does on every reload).
 */
export default function LivePdfPreview({ url, version }: { url: string; version: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "updating" | "error">("loading");
  const renderId = useRef(0);

  useEffect(() => {
    const id = ++renderId.current;
    const controller = new AbortController();

    (async () => {
      try {
        setStatus((s) => (s === "loading" ? "loading" : "updating"));
        const pdfjs = await import("pdfjs-dist");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        }
        const res = await fetch(`${url}?v=${encodeURIComponent(version)}`, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`Preview failed (${res.status})`);
        const data = new Uint8Array(await res.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;

        const width = (containerRef.current?.clientWidth ?? 600) - 32;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        // Render every page off-screen first, then swap them in all at once.
        const canvases: HTMLCanvasElement[] = [];
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const scale = width / base.width;
          const viewport = page.getViewport({ scale: scale * ratio });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(width)}px`;
          canvas.style.height = `${Math.floor(viewport.height / ratio)}px`;
          canvas.className = "mx-auto block rounded-md bg-white shadow-[0_2px_8px_rgba(15,35,65,0.08),0_16px_40px_-20px_rgba(15,35,65,0.35)]";
          await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
          canvases.push(canvas);
        }
        await doc.destroy();
        if (id !== renderId.current || !pagesRef.current) return;
        pagesRef.current.replaceChildren(...canvases);
        setStatus("ready");
      } catch (e) {
        if (controller.signal.aborted || id !== renderId.current) return;
        console.error(e);
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, [url, version]);

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto bg-gradient-to-b from-[#E9EFF7] to-[#DFE7F2] p-4">
      {status === "loading" ? (
        <div className="flex h-full min-h-60 items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading preview…
        </div>
      ) : null}
      {status === "error" ? (
        <div className="flex h-full min-h-60 items-center justify-center px-6 text-center text-sm text-slate-500">
          The preview couldn&apos;t load. Keep editing; it will try again after the next save.
        </div>
      ) : null}
      {status === "updating" ? (
        <span className="absolute right-6 top-6 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-600 shadow ring-1 ring-[#E4E9F0]">
          <Loader2 className="h-3 w-3 animate-spin" /> Updating
        </span>
      ) : null}
      <div ref={pagesRef} className="space-y-4" />
    </div>
  );
}
