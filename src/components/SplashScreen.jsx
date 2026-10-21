import React, { useEffect, useState } from "react";

const LOGO_URL =
  "https://media.base44.com/images/public/6a4fdf2b258cb191501a9b70/8110b5b8f_file_000000005ad88211bae5cf9879f6baf9.png";
const SPLASH_DURATION = 5000; // 5 seconds
const FADE_DURATION = 600;

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), SPLASH_DURATION);
    const hideTimer = setTimeout(
      () => setVisible(false),
      SPLASH_DURATION + FADE_DURATION
    );
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-[600ms] ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="sheen relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-3xl ring-1 ring-border/60">
        <img
          src={LOGO_URL}
          alt="Quantum Vault"
          className="h-full w-full object-cover"
        />
      </div>
      <h1 className="mt-5 text-xl font-extrabold tracking-tight text-foreground">
        Quantum Vault
      </h1>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        JEE Resource Hub
      </p>
      <div className="mt-6 h-1 w-24 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            animation: `splash-progress ${SPLASH_DURATION}ms ease-out forwards`,
          }}
        />
      </div>
      <style>{`
        @keyframes splash-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}