import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "dreamiit_admin_unlocked_v2";
const EXPIRY_KEY = "dreamiit_admin_expiry_v2";
// Admin access expires after this many minutes of inactivity
const SESSION_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

export function useAdminAccess() {
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1, 2, or 3
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) === "true";
    const expiry = Number(localStorage.getItem(EXPIRY_KEY) || 0);
    if (stored && Date.now() < expiry) {
      setUnlocked(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRY_KEY);
    }
  }, []);

  const openModal = () => {
    setStep(1);
    setPasswordInput("");
    setError("");
    setToken("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPasswordInput("");
    setError("");
    setToken("");
  };

  const submitPassword = async () => {
    setError("");
    try {
      const action = `verifyPassword${step}`;
      const payload = { action, password: passwordInput };
      if (step > 1) payload.token = token;
      const res = await base44.functions.invoke("adminAuth", payload);
      if (res.data.verified) {
        if (step === 3) {
          localStorage.setItem(STORAGE_KEY, "true");
          localStorage.setItem(EXPIRY_KEY, String(Date.now() + SESSION_TIMEOUT_MS));
          setUnlocked(true);
          setModalOpen(false);
          setError("");
        } else {
          setToken(res.data.token);
          setStep(step + 1);
          setPasswordInput("");
          setError("");
        }
      } else {
        setError(res.data.error || "Wrong password");
      }
    } catch (e) {
      setError("Could not verify. Try again.");
    }
  };

  const lock = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    setUnlocked(false);
  };

  return {
    unlocked,
    modalOpen,
    step,
    passwordInput,
    setPasswordInput,
    error,
    openModal,
    closeModal,
    submitPassword,
    lock,
  };
}