import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import ShareApp from "@/components/ShareApp";

const RATED_KEY = "dreamiit_exit_rated";

export default function ExitRatingPrompt() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    const checkExistingFeedback = async () => {
      const did = localStorage.getItem("dreamiit_device_id");
      if (!did) return;
      try {
        const existing = await base44.entities.Feedback.filter(
          { device_id: did },
          "-created_date",
          1
        );
        if (Array.isArray(existing) && existing.length > 0) {
          localStorage.setItem(RATED_KEY, "1");
        }
      } catch {
        /* ignore */
      }
    };
    checkExistingFeedback();

    const onResourceClosed = () => {
      if (localStorage.getItem(RATED_KEY)) return;
      setRated(false);
      setRating(0);
      setOpen(true);
    };
    window.addEventListener("dreamiit:resource-closed", onResourceClosed);
    return () =>
      window.removeEventListener("dreamiit:resource-closed", onResourceClosed);
  }, []);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating to continue");
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
      await base44.entities.Feedback.create({
        device_id: did,
        rating,
        category: "other",
        message: `Exit rating: ${rating}/5`,
      });
      localStorage.setItem(RATED_KEY, "1");
      setRated(true);
      toast.success("Thanks for your rating!");
    } catch (e) {
      toast.error("Could not submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        /* Compulsory: do not allow closing without rating */
      }}
    >
      <DialogContent
        className="max-w-sm"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {!rated ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                How was the resource?
              </DialogTitle>
            </DialogHeader>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Please rate your experience to continue.
            </p>
            <div className="flex items-center justify-center gap-1 py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition transform hover:scale-110"
                >
                  <Star
                    className={`h-9 w-9 ${
                      (hover || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-300 dark:fill-slate-700 dark:text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-center">
                <Share2 className="h-5 w-5 text-indigo-600" />
                Share with friends
              </DialogTitle>
            </DialogHeader>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Thanks for rating! Share Quantum Vault with your friends so they
              can also access free JEE resources.
            </p>
            <ShareApp />
            <Button onClick={handleDone} className="w-full">
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}