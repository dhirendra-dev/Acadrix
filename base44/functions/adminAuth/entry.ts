import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const ADMIN_PASSWORD_1 = Deno.env.get("ADMIN_PASSWORD");
const ADMIN_PASSWORD_2 = Deno.env.get("ADMIN_PASSWORD_2");
const ADMIN_PASSWORD_3 = Deno.env.get("ADMIN_PASSWORD_3");
const SIGNING_KEY = "dreamiit_admin_2024";

Deno.serve(async (req) => {
  try {
    const { action, password, token } = await req.json();

    if (action === "verifyPassword1") {
      if (!ADMIN_PASSWORD_1) {
        return Response.json({ verified: false, error: "Server not configured" }, { status: 500 });
      }
      if (password === ADMIN_PASSWORD_1) {
        const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        const data = `step1:${expiry}`;
        const tokenPayload = btoa(`${data}:${SIGNING_KEY}`);
        return Response.json({ verified: true, token: tokenPayload });
      }
      return Response.json({ verified: false, error: "Wrong password" });
    }

    if (action === "verifyPassword2") {
      if (!token || !password) {
        return Response.json({ verified: false, error: "Missing token or password" });
      }
      if (!ADMIN_PASSWORD_2) {
        return Response.json({ verified: false, error: "Server not configured" }, { status: 500 });
      }
      try {
        const decoded = atob(token);
        const parts = decoded.split(":");
        const step = parts[0];
        const expiry = Number(parts[1]);
        const key = parts.slice(2).join(":");

        if (key !== SIGNING_KEY) {
          return Response.json({ verified: false, error: "Invalid token" });
        }
        if (Date.now() > expiry) {
          return Response.json({ verified: false, error: "Session expired" });
        }
        if (step !== "step1") {
          return Response.json({ verified: false, error: "Invalid step" });
        }
        if (password === ADMIN_PASSWORD_2) {
          const newExpiry = Date.now() + 5 * 60 * 1000;
          const data = `step2:${newExpiry}`;
          const newToken = btoa(`${data}:${SIGNING_KEY}`);
          return Response.json({ verified: true, token: newToken });
        }
        return Response.json({ verified: false, error: "Wrong password" });
      } catch (e) {
        return Response.json({ verified: false, error: "Invalid token" });
      }
    }

    if (action === "verifyPassword3") {
      if (!token || !password) {
        return Response.json({ verified: false, error: "Missing token or password" });
      }
      if (!ADMIN_PASSWORD_3) {
        return Response.json({ verified: false, error: "Server not configured" }, { status: 500 });
      }
      try {
        const decoded = atob(token);
        const parts = decoded.split(":");
        const step = parts[0];
        const expiry = Number(parts[1]);
        const key = parts.slice(2).join(":");

        if (key !== SIGNING_KEY) {
          return Response.json({ verified: false, error: "Invalid token" });
        }
        if (Date.now() > expiry) {
          return Response.json({ verified: false, error: "Session expired" });
        }
        if (step !== "step2") {
          return Response.json({ verified: false, error: "Invalid step" });
        }
        if (password === ADMIN_PASSWORD_3) {
          return Response.json({ verified: true });
        }
        return Response.json({ verified: false, error: "Wrong password" });
      } catch (e) {
        return Response.json({ verified: false, error: "Invalid token" });
      }
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});