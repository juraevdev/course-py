"use client";

import { DownloadSimple, Printer } from "@phosphor-icons/react";
import { Button } from "./ui";

export function DownloadTopicButton({
  title,
  summary,
  content,
  resourceUrl,
}: {
  title: string;
  summary: string;
  content: string;
  resourceUrl?: string | null;
}) {
  function downloadMd() {
    const text = [
      `# ${title}`,
      "",
      summary,
      "",
      "---",
      "",
      content,
      resourceUrl ? `\n\nResurs: ${resourceUrl}` : "",
    ].join("\n");

    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w\u0400-\u04FF\s-]/g, "").trim() || "mavzu"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPdf() {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 24px;color:#111;line-height:1.6}
  h1{font-size:28px;margin:0 0 8px}
  .sum{color:#555;margin-bottom:24px}
  pre{white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:13px;background:#f7f6f3;padding:16px;border-radius:8px}
  a{color:#111}
  @media print{body{margin:0}}
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<p class="sum">${escapeHtml(summary)}</p>
<pre>${escapeHtml(content)}</pre>
${resourceUrl ? `<p>Resurs: <a href="${escapeHtml(resourceUrl)}">${escapeHtml(resourceUrl)}</a></p>` : ""}
<script>window.onload=()=>window.print()</script>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={downloadMd}>
        <DownloadSimple weight="bold" size={16} />
        .md
      </Button>
      <Button type="button" variant="secondary" onClick={printPdf}>
        <Printer weight="bold" size={16} />
        PDF
      </Button>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
