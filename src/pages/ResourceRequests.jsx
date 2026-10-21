import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { BookPlus, CheckCircle2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import MyRequests from "@/components/MyRequests";

export default function ResourceRequests() {
  const navigate = useNavigate();
  const {
    unlocked,
    modalOpen,
    step,
    passwordInput,
    setPasswordInput,
    error,
    openModal,
    closeModal,
    submitPassword,
  } = useAdminAccess();
  const isAdmin = unlocked;

  const [bookName, setBookName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [publicRequests, setPublicRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPublic = async () => {
    try {
      const data = await base44.entities.ResourceRequest.list("-created_date", 200);
      const arr = Array.isArray(data) ? data : [];
      setPublicRequests(
        arr.filter(
          (r) => r.status === "fulfilled" || r.status === "already_available"
        )
      );
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublic();
  }, []);

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
      loadPublic();
    } catch (e) {
      toast.error("Could not submit request");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        isAdmin={isAdmin}
        onLogoClick={() => (isAdmin ? navigate("/admin") : openModal())}
        adminModal={{
          open: modalOpen,
          step,
          passwordInput,
          setPasswordInput,
          error,
          onClose: closeModal,
          onSubmitPassword: submitPassword,
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Hero */}
        <section className="mb-8 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary">
            <BookPlus className="h-3.5 w-3.5" /> Resource Requests
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Request & track resources
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Can't find something? Request it here. See where admin has placed
            requested resources.
          </p>
        </section>

        {/* Submit form */}
        <section className="mb-8">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <Label>Book / Resource Name</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="e.g. HC Verma Part 2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !submitting) handleSubmit();
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="shrink-0"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <BookPlus className="h-4 w-4" /> Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* My requests */}
        <section className="mb-8">
          <MyRequests />
        </section>

        {/* Public responses */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h2 className="section-eyebrow">Fulfilled Requests</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : publicRequests.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
              <p className="text-sm text-muted-foreground">
                No fulfilled requests yet. When admin places a requested
                resource, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {publicRequests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-border bg-card p-3.5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 text-sm font-bold text-foreground">
                      {r.book_name}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        r.status === "fulfilled"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                      }`}
                    >
                      {r.status === "fulfilled" ? "Placed" : "Available"}
                    </span>
                  </div>
                  {r.admin_note && (
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        {r.admin_note}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}