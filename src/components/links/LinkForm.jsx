import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const types = [
  { value: "notes", label: "Notes" },
  { value: "pyq", label: "Previous Year Questions" },
  { value: "dpp", label: "DPP" },
  { value: "video", label: "Video Lecture" },
  { value: "book", label: "Book / Module" },
  { value: "other", label: "Other" },
];

export default function LinkForm({ open, onClose, onSubmit, editingLink }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState("notes");
  const [isRjSir, setIsRjSir] = useState(false);

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title || "");
      setUrl(editingLink.url || "");
      setDescription(editingLink.description || "");
      setResourceType(editingLink.resource_type || "notes");
      setIsRjSir(editingLink.is_rj_sir || false);
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setResourceType("notes");
      setIsRjSir(false);
    }
  }, [editingLink, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onSubmit({
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      resource_type: resourceType,
      is_rj_sir: isRjSir,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingLink ? "Edit Resource" : "Add Resource"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ltitle">Title</Label>
            <Input
              id="ltitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kinematics Notes - Chapter 1"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lurl">Google Drive Link</Label>
            <Input
              id="lurl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ldesc">Description</Label>
            <Textarea
              id="ldesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this resource"
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label>RJ Sir PDF</Label>
              <p className="text-xs text-muted-foreground">Tag as RJ Sir content</p>
            </div>
            <Switch checked={isRjSir} onCheckedChange={setIsRjSir} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingLink ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}