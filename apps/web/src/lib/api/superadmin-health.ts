const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error && typeof body.error === "string"
        ? body.error
        : res.status === 404
          ? "Not found"
          : `Something went wrong (status ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export type SystemHealth = {
  database: {
    healthy: boolean;
    latencyMs: number;
    error: string | null;
  };
  cron: {
    latestRun: {
      id: string;
      jobName: string;
      ranAt: string;
      rowsAffected: number;
      success: boolean;
      errorMessage: string | null;
    } | null;
    isOnSchedule: boolean;
  };
  checkedAt: string;
};

export async function fetchSystemHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_URL}/superadmin/health`, {
    credentials: "include",
  });
  return handleResponse<SystemHealth>(res);
}