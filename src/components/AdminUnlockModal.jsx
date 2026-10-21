import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, KeyRound } from "lucide-react";

export default function AdminUnlockModal({
  open,
  step,
  passwordInput,
  setPasswordInput,
  error,
  onClose,
  onSubmitPassword,
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Admin Access</DialogTitle>
          <DialogDescription className="text-center">
            Enter password {step} of 3
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmitPassword()}
            placeholder={`Password ${step}`}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button onClick={onSubmitPassword} className="w-full">
            <KeyRound className="mr-1.5 h-4 w-4" />{" "}
            {step === 3 ? "Unlock" : "Continue"}
          </Button>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  n <= step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}