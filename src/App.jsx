import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Resources from "@/pages/Resources";
import ResourceRequests from "@/pages/ResourceRequests";
import ResourceDetail from "@/pages/ResourceDetail";

function LoadingScreen() {
  return <div className="loading-screen"><div className="loading-mark"><img src="/brand/acadrix-logo.png" alt="Acadrix" /><span /></div><p>Preparing your workspace</p></div>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setReady(true), 260); return () => window.clearTimeout(timer); }, []);
  if (!ready) return <LoadingScreen />;
  return <BrowserRouter><AnimatePresence mode="wait"><Routes><Route element={<Layout />}><Route path="/" element={<Home />} /><Route path="/resources" element={<Resources />} /><Route path="/requests" element={<ResourceRequests />} /><Route path="/resource/:id" element={<ResourceDetail />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></AnimatePresence></BrowserRouter>;
}
