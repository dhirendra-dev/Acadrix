import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, BookPlus } from "lucide-react";
import { toast } from "sonner";
import MyRequests from "@/components/MyRequests";

export default function ResourceRequestModal({ open, onClose }) {
  const [bookName, setBookName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!bookName.trim()) {
      toast.error("Please enter a book/resource name");
      return;
    }
    setSubmitting(true);
    try {
      let did = localStorage.getItem("dreamiit_device_id");
      if (!did) {
        did =
          "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("dreamiit_device_id", did);
      }
      await base44.entities.ResourceRequest.create({
        book_name: bookName.trim(),
        device_id: did,
        status: "pending",
      });
      toast.success("Request submitted! Admin will add it soon.");
      setBookName("");
      onClose();
    } catch (e) {
      toast.error("Could not submit request");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="h-5 w-5 text-primary" />
            Request a Resource
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Can't find what you're looking for? Enter the book or resource name
            below. Admin will add the PDF soon.
          </p>
          <div className="space-y-2">
            <Label>Book / Resource Name</Label>
            <Input
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="e.g. HC Verma Part 2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !submitting) handleSubmit();
              }}
            />
          </div>
        </div>
        <MyRequests />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}