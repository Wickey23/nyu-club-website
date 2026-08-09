"use client";

import { FormEvent, useState } from "react";

type ImportedMedia = {
  id: string;
  title: string;
  mediaType: "image" | "video";
  driveUrl: string;
  sourceUrl: string;
};

export default function DriveFolderImporter() {
  const [folderUrl, setFolderUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<ImportedMedia[]>([]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("Scanning Google Drive folder…");
    setMedia([]);
    const response = await fetch("/api/admin/drive-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderUrl }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to import that folder.");
      return;
    }
    setMedia(data.media || []);
    setMessage(`Found ${data.found} media file${data.found === 1 ? "" : "s"}. Imported ${data.imported}; skipped ${data.skipped} duplicate${data.skipped === 1 ? "" : "s"}.${data.truncated ? " Import was capped at 500 files." : ""}`);
  }

  return <main className="drive-import-page">
    <div className="drive-import-wrap">
      <header className="drive-import-head">
        <div>
          <span className="admin-kicker">Gallery media</span>
          <h1>Import a Google Drive folder</h1>
          <p>Paste one shared folder link. The CMS scans supported images and videos, including nested folders, and publishes new files into the Gallery media library.</p>
        </div>
        <a href="/admin">← Board CMS</a>
      </header>

      <section className="cms-panel drive-import-card">
        <form onSubmit={submit} className="drive-import-form">
          <label>Google Drive folder share link
            <input value={folderUrl} onChange={e=>setFolderUrl(e.target.value)} required placeholder="https://drive.google.com/drive/folders/..." />
          </label>
          <button className="admin-primary" disabled={loading}>{loading ? "Scanning…" : "Import folder"}</button>
        </form>
        <div className="drive-help">
          <b>Folder sharing requirement</b>
          <span>Google Drive → Share → General access → Anyone with the link → Viewer.</span>
          <span>Images and videos are imported; Docs, Sheets, PDFs and other files are ignored.</span>
        </div>
        {message && <div className="cms-notice drive-result">{message}</div>}
      </section>

      {media.length > 0 && <section className="cms-panel">
        <div className="cms-panel-head"><div><span className="admin-kicker">Last import</span><h2>Folder media</h2></div><b>{media.length} found</b></div>
        <div className="drive-media-grid">{media.slice(0,60).map(item=><article key={item.id}>
          <div className="drive-media-kind">{item.mediaType}</div>
          <b>{item.title}</b>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open in Drive ↗</a>
        </article>)}</div>
        {media.length > 60 && <p className="drive-more">Showing the first 60 results here. All discovered files were processed.</p>}
      </section>}
    </div>
  </main>;
}
