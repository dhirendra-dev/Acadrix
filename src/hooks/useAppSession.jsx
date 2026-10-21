import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

const DEVICE_KEY = "dreamiit_device_id";
const HEARTBEAT_MS = 2 * 60 * 1000; // update every 2 min

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      "dev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function useAppSession() {
  useEffect(() => {
    const deviceId = getDeviceId();
    const now = new Date().toISOString();

    const ping = async () => {
      try {
        const existing = await base44.entities.AppSession.filter(
          { device_id: deviceId },
          "-created_date",
          1
        );
        if (existing && existing.length > 0) {
          await base44.entities.AppSession.update(existing[0].id, {
            last_active: new Date().toISOString(),
          });
        } else {
          await base44.entities.AppSession.create({
            device_id: deviceId,
            last_active: now,
            first_seen: now,
          });
        }
      } catch {
        /* ignore */
      }
    };

    ping();
    const interval = setInterval(ping, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, []);
}