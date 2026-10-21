import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminAppConfig() {
  const [config, setConfig] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadLabel, setDownloadLabel] = useState("Download App");
  const [downloadVisible, setDownloadVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.AppConfig.list("-created_date", 1);
        const c = Array.isArray(data) && data[0] ? data[0] : null;
        setConfig(c);
        if (c) {
          setDownloadUrl(c.download_url || "");
          setDownloadLabel(c.download_label || "Download App");
          setDownloadVisible(c.download_visible !== false);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        download_url: downloadUrl.trim(),
        download_label: downloadLabel.trim() || "Download App",
        download_visible: downloadVisible,
      };
      if (config) {
        await base44.entities.AppConfig.update(config.id, payload);
      } else {
        const created = await base44.entities.AppConfig.create(payload);
        setConfig(created);
      }
      toast.success("Download settings saved");
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Download App Banner
        </h3>
      </div>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Configure the media file link shown on the homepage "Download App"
        banner. Changes apply to both the normal site and the /app route.
      </p>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Media File Link (Download URL)</Label>
            <Input
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="https://...apk"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Button Label</Label>
            <Input
              value={downloadLabel}
              onChange={(e) => setDownloadLabel(e.target.value)}
              placeholder="Download App"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Show banner on homepage
            </span>
            <Switch checked={downloadVisible} onCheckedChange={setDownloadVisible} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" /> Save
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}