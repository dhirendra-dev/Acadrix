import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const colors = [
  "blue", "green", "purple", "orange",
  "rose", "cyan", "amber", "indigo",
];

const colorBg = {
  blue: "bg-blue-500", green: "bg-emerald-500", purple: "bg-violet-500",
  orange: "bg-orange-500", rose: "bg-rose-500", cyan: "bg-cyan-500",
  amber: "bg-amber-500", indigo: "bg-indigo-500",
};

export default function FolderForm({ open, onClose, onSubmit, editingFolder }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("blue");

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name || "");
      setDescription(editingFolder.description || "");
      setColor(editingFolder.color || "blue");
    } else {
      setName("");
      setDescription("");
      setColor("blue");
    }
  }, [editingFolder, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), color });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingFolder ? "Edit Folder" : "New Folder"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fname">Folder Name</Label>
            <Input
              id="fname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Physics Class 11"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fdesc">Description</Label>
            <Textarea
              id="fdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ${colorBg[c]} transition ${
                    color === c ? "ring-2 ring-offset-2 ring-slate-800" : ""
                  }`}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingFolder ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}