import { DEVICE_ID_KEY, GROUP_STORAGE_KEY } from "@/constants";

/** Stable per-browser id stored in localStorage. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID?.()
        ?? `d-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/** Read the stored group id for auto-redirect. */
export function getStoredGroupId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(GROUP_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Persist (or clear) the active group id. */
export function setStoredGroupId(groupId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (groupId) localStorage.setItem(GROUP_STORAGE_KEY, groupId);
    else localStorage.removeItem(GROUP_STORAGE_KEY);
  } catch { /* ignore */ }
}
