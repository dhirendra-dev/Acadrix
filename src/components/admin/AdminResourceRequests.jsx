import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  BookPlus,
  Loader2,
  CheckCircle2,
  Clock,
  Trash2,
  MapPin,
  MessageSquare,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminResourceRequests() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [fulfillingId, setFulfillingId] = useState(null);
  const [urlInput, setUrlInput] = useState({});
  const [actionMode, setActionMode] = useState({});
  const [noteInput, setNoteInput] = useState({});
  const [otherInput, setOtherInput] = useState({});
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState({});

  const load = async () => {
    try {
      const data = await base44.entities.ResourceRequest.list("-created_date", 200);
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const data = await base44.entities.Folder.list("-created_date", 200);
      setFolders(Array.isArray(data) ? data : []);
    } catch (e) {
      /* ignore */
    }
  };

  React.useEffect(() => {
    load();
    loadFolders();
  }, []);

  const toggleFolder = (reqId, folderId) => {
    const current = new Set(selectedFolders[reqId] || []);
    if (current.has(folderId)) current.delete(folderId);
    else current.add(folderId);
    setSelectedFolders({ ...selectedFolders, [reqId]: Array.from(current) });
  };

  const handleFulfill = async (req) => {
    const selected = selectedFolders[req.id] || [];
    if (selected.length === 0) {
      toast.error("Select at least one folder");
      return;
    }
    const names = selected
      .map((fid) => folders.find((f) => f.id === fid)?.name)
      .filter(Boolean);
    const note = `Placed in: ${names.join(", ")}`;
    setFulfillingId(req.id);
    try {
      await base44.entities.ResourceRequest.update(req.id, {
        status: "fulfilled",
        admin_note: note,
        resource_url: "",
      });
      toast.success("Request fulfilled! Reply sent.");
      setSelectedFolders({ ...selectedFolders, [req.id]: [] });
      setActionMode({ ...actionMode, [req.id]: null });
      setFulfillingId(null);
      load();
    } catch (e) {
      toast.error("Could not update");
      setFulfillingId(null);
    }
  };

  const handleAlreadyThere = async (req) => {
    const selected = selectedFolders[req.id] || [];
    if (selected.length === 0) {
      toast.error("Select at least one folder");
      return;
    }
    const names = selected
      .map((fid) => folders.find((f) => f.id === fid)?.name)
      .filter(Boolean);
    const note = `Available in: ${names.join(", ")}`;
    setFulfillingId(req.id);
    try {
      await base44.entities.ResourceRequest.update(req.id, {
        status: "already_available",
        admin_note: note,
      });
      toast.success("Reply sent!");
      setSelectedFolders({ ...selectedFolders, [req.id]: [] });
      setActionMode({ ...actionMode, [req.id]: null });
      setFulfillingId(null);
      load();
    } catch (e) {
      toast.error("Could not update");
      setFulfillingId(null);
    }
  };

  const handleOthers = async (req) => {
    const msg = otherInput[req.id]?.trim();
    if (!msg) {
      toast.error("Enter your message");
      return;
    }
    setFulfillingId(req.id);
    try {
      await base44.entities.ResourceRequest.update(req.id, {
        status: "other",
        admin_note: msg,
      });
      toast.success("Reply sent!");
      setOtherInput({ ...otherInput, [req.id]: "" });
      setActionMode({ ...actionMode, [req.id]: null });
      setFulfillingId(null);
      load();
    } catch (e) {
      toast.error("Could not update");
      setFulfillingId(null);
    }
  };

  const handleDelete = async (req) => {
    if (!confirm(`Delete request for "${req.book_name}"?`)) return;
    try {
      await base44.entities.ResourceRequest.delete(req.id);
      toast.success("Request deleted");
      load();
    } catch (e) {
      toast.error("Could not delete");
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const replied = requests.filter(
    (r) =>
      r.status === "fulfilled" ||
      r.status === "already_available" ||
      r.status === "other"
  );

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
        <BookPlus className="h-4 w-4 text-indigo-600" /> Resource Requests
        {pending.length > 0 && (
          <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            {pending.length}
          </span>
        )}
      </h2>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : requests.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">
          No resource requests yet
        </p>
      ) : (
        <div className="space-y-4">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-1 text-xs font-bold text-rose-600">
                <Clock className="h-3 w-3" /> Pending ({pending.length})
              </h3>
              <div className="space-y-2">
                {pending.map((r) => {
                  const mode = actionMode[r.id];
                  return (
                    <div
                      key={r.id}
                      className="rounded-xl border border-amber-200 bg-amber-50/50 p-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {r.book_name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {r.device_id.slice(0, 14)}...
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(r)}
                          className="shrink-0 text-slate-300 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {!mode && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              setActionMode({ ...actionMode, [r.id]: "fulfill" })
                            }
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Fulfill
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setActionMode({ ...actionMode, [r.id]: "already" })
                            }
                            className="flex-1 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                          >
                            <MapPin className="h-3.5 w-3.5" /> Already There
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setActionMode({ ...actionMode, [r.id]: "other" })
                            }
                            className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-50"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Others
                          </Button>
                        </div>
                      )}

                      {mode === "fulfill" && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium text-slate-500">
                            Select folder(s) where this resource is placed:
                          </p>
                          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                            {folders.length === 0 ? (
                              <p className="py-2 text-center text-[10px] text-slate-400">
                                No folders found
                              </p>
                            ) : (
                              folders.map((f) => {
                                const checked =
                                  (selectedFolders[r.id] || []).includes(f.id);
                                return (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => toggleFolder(r.id, f.id)}
                                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                                      checked
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <Folder className="h-3.5 w-3.5 shrink-0" />
                                    <span className="flex-1 truncate">{f.name}</span>
                                    {checked && (
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleFulfill(r)}
                              disabled={fulfillingId === r.id}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                              {fulfillingId === r.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Send Reply"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setActionMode({ ...actionMode, [r.id]: null })
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {mode === "already" && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium text-slate-500">
                            Select folder(s) where this resource is available:
                          </p>
                          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                            {folders.length === 0 ? (
                              <p className="py-2 text-center text-[10px] text-slate-400">
                                No folders found
                              </p>
                            ) : (
                              folders.map((f) => {
                                const checked =
                                  (selectedFolders[r.id] || []).includes(f.id);
                                return (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => toggleFolder(r.id, f.id)}
                                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                                      checked
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <Folder className="h-3.5 w-3.5 shrink-0" />
                                    <span className="flex-1 truncate">{f.name}</span>
                                    {checked && (
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAlreadyThere(r)}
                              disabled={fulfillingId === r.id}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                            >
                              {fulfillingId === r.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Send Reply"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setActionMode({ ...actionMode, [r.id]: null })
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {mode === "other" && (
                        <div className="space-y-2">
                          <Textarea
                            value={otherInput[r.id] || ""}
                            onChange={(e) =>
                              setOtherInput({
                                ...otherInput,
                                [r.id]: e.target.value,
                              })
                            }
                            placeholder="Type whatever you want to tell the student..."
                            className="text-xs"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleOthers(r)}
                              disabled={fulfillingId === r.id}
                              className="flex-1 bg-slate-700 hover:bg-slate-800"
                            >
                              {fulfillingId === r.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Send Reply"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setActionMode({ ...actionMode, [r.id]: null })
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Replied */}
          {replied.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Replied ({replied.length})
              </h3>
              <div className="space-y-1.5">
                {replied.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                        {r.book_name}
                      </p>
                      <button
                        onClick={() => handleDelete(r)}
                        className="shrink-0 text-slate-300 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {r.status === "fulfilled" && r.admin_note && (
                      <div className="mt-1 flex items-start gap-1 rounded-md bg-emerald-50 px-2 py-1">
                        <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500" />
                        <p className="text-[10px] text-slate-600">
                          {r.admin_note}
                        </p>
                      </div>
                    )}
                    {r.status === "already_available" && r.admin_note && (
                      <div className="mt-1 flex items-start gap-1 rounded-md bg-indigo-50 px-2 py-1">
                        <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0 text-indigo-500" />
                        <p className="text-[10px] text-slate-600">
                          {r.admin_note}
                        </p>
                      </div>
                    )}
                    {r.status === "other" && r.admin_note && (
                      <div className="mt-1 flex items-start gap-1 rounded-md bg-slate-100 px-2 py-1">
                        <MessageSquare className="mt-0.5 h-2.5 w-2.5 shrink-0 text-slate-500" />
                        <p className="text-[10px] text-slate-600">
                          {r.admin_note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}