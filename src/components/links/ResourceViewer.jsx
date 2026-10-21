import React, { useState, useEffect } from "react";
import { X, ExternalLink, Download, FolderOpen, FileText, AlertCircle, RefreshCw, Link2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

function parseDriveUrl(url) {
  if (!url) return { type: "unknown", embedUrl: url, directUrl: url, fileId: null };

  // Google Drive file
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (fileMatch) {
    const fileId = fileMatch[1];
    return {
      type: "file",
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      directUrl: `https://drive.google.com/file/d/${fileId}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    };
  }

  // Google Drive open?id=
  if (url.includes("drive.google.com") && url.includes("id=")) {
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch) {
      const fileId = idMatch[1];
      return {
        type: "file",
        fileId,
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        directUrl: `https://drive.google.com/file/d/${fileId}/view`,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      };
    }
  }

  // Google Drive folder
  const folderMatch = url.match(/drive\.google\.com\/drive\/folders\/([^/?]+)/);
  if (folderMatch) {
    const folderId = folderMatch[1];
    return {
      type: "folder",
      folderId,
      embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#list`,
      directUrl: `https://drive.google.com/drive/folders/${folderId}`,
    };
  }

  // Google Docs/Sheets/Slides
  const docsMatch = url.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([^/?]+)/);
  if (docsMatch) {
    const kind = docsMatch[1];
    const fileId = docsMatch[2];
    const embedUrl =
      kind === "document"
        ? `https://docs.google.com/document/d/${fileId}/preview`
        : kind === "spreadsheets"
        ? `https://docs.google.com/spreadsheets/d/${fileId}/preview`
        : `https://docs.google.com/presentation/d/${fileId}/preview`;
    return { type: "file", fileId, embedUrl, directUrl: url };
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) {
    return {
      type: "video",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      directUrl: url,
    };
  }

  return { type: "unknown", embedUrl: url, directUrl: url };
}

export default function ResourceViewer({ link, onClose }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Log a view when the viewer opens
  useEffect(() => {
    if (!link) return;
    let did = localStorage.getItem("dreamiit_device_id");
    if (!did) {
      did = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("dreamiit_device_id", did);
    }
    base44.entities.ResourceView.create({
      device_id: did,
      resource_link_id: link.id,
      resource_title: link.title,
      resource_type: link.resource_type || "other",
      folder_id: link.folder_id || "",
    }).catch(() => {});
  }, [link]);

  if (!link) return null;
  const parsed = parseDriveUrl(link.url);

  const handleFolderOpen = () => {
    window.open(parsed.directUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(parsed.directUrl);
    toast.success("Link copied — paste in browser");
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="mr-2 flex min-w-0 items-center gap-2">
          {parsed.type === "folder" ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-indigo-500" />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <h3 className="truncate text-sm font-semibold text-slate-800">{link.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Primary: Open in Browser */}
          <a
            href={parsed.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Open in Browser <ExternalLink className="h-3 w-3" />
          </a>
          {/* Download for files */}
          {parsed.type === "file" && parsed.downloadUrl && (
            <a
              href={parsed.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
            >
              <Download className="h-3 w-3" />
            </a>
          )}
          <button
            onClick={handleCopyLink}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            title="Copy link"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 overflow-hidden bg-slate-50">
        {parsed.type === "folder" ? (
          /* Folder: show embedded view + prominent open button overlay */
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-amber-50 px-4 py-2.5">
              <p className="flex items-center gap-1.5 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Can't see sub-folders or files? Open in browser for full access.
              </p>
              <button
                onClick={handleFolderOpen}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
              >
                Open Folder <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <iframe
              key={retryKey}
              src={parsed.embedUrl}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen"
              title={link.title}
            />
          </div>
        ) : (
          /* File/video: embed with error fallback */
          <>
            {loadFailed ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <AlertCircle className="h-12 w-12 text-amber-400" />
                <div>
                  <p className="font-medium text-slate-700">Couldn't load preview</p>
                  <p className="mt-1 text-sm text-slate-500">
                    The file may need to be shared publicly, or your connection blocked it.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setLoadFailed(false);
                      setRetryKey((k) => k + 1);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    <RefreshCw className="h-4 w-4" /> Retry
                  </button>
                  <a
                    href={parsed.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Open in Browser <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ) : (
              <iframe
                key={retryKey}
                src={parsed.embedUrl}
                className="h-full w-full border-0"
                allow="autoplay; fullscreen"
                title={link.title}
                onError={() => setLoadFailed(true)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}