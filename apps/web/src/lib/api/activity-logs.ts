const API_URL = import.meta.env.VITE_API_URL;

export type ActivityLog = {
  id: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string | null;
  createdAt: string;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const res = await fetch(`${API_URL}/activity-logs`, {
    credentials: "include",
  });
  return handleResponse<ActivityLog[]>(res);
}