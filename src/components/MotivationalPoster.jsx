import React from "react";
import { Image } from "@/components/ui/image";

const LOGO_URL = "https://media.base44.com/images/public/6a4fdf2b258cb191501a9b70/8110b5b8f_file_000000005ad88211bae5cf9879f6baf9.png";

const today = new Date();
const isIndependenceDay = today.getMonth() === 7 && today.getDate() === 15;

export default function MotivationalPoster() {
  if (isIndependenceDay) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-saffron via-white to-green-700" style={{ backgroundImage: "linear-gradient(to bottom, #FF9933 0%, #FF9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%, #138808 100%)" }} />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative flex flex-col items-center justify-center gap-5 px-6 py-14 text-center">
          <div className="sheen rounded-2xl bg-white/95 p-3 shadow-2xl ring-1 ring-white/60">
            <Image
              src={LOGO_URL}
              alt="Quantum Vault Logo"
              fittingType="fit"
              className="h-24 w-24 object-contain"
            />
          </div>
          <div className="rounded-xl bg-white/90 px-6 py-4 shadow-lg">
            <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
              Quantum Vault
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-orange-600">
              Happy Independence
            </h2>
            <h2 className="text-3xl font-extrabold text-green-700">
              Day
            </h2>
            <p className="mt-3 text-sm font-medium text-slate-700">
              Jai Hind! 🇮🇳 Keep grinding, keep dreaming. Your IIT journey starts here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800" />
      {/* Subtle decorative glow */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
      <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/5" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <div className="sheen rounded-2xl bg-white/95 p-3 shadow-2xl ring-1 ring-white/60">
          <Image
            src={LOGO_URL}
            alt="Quantum Vault Logo"
            fittingType="fit"
            className="h-28 w-28 object-contain"
          />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-200">
            Quantum Vault
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-white">
            Best Wishes
          </h2>
          <h2 className="text-3xl font-extrabold text-amber-300">
            Future IITians
          </h2>
          <p className="mt-3 text-sm text-indigo-100">
            Keep grinding, keep dreaming. Your IIT journey starts here.
          </p>
        </div>
      </div>
    </div>
  );
}