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

export type DataIntegrityReport = {
  tableCounts: {
    orders: number;
    products: number;
    categories: number;
    users: number;
    activityLogs: number;
  };
  orphanedRecords: {
    orderItemsWithMissingProduct: number;
  };
  staleGuestCarts: {
    count: number;
    olderThanDays: number;
  };
  inventoryIssues: {
    negativeStock: { id: string; name: string; stock: number }[];
  };
  schemaDrift: {
    checked: number;
    missing: { table: string; column: string; exists: boolean }[];
    healthy: boolean;
  };
  latestCronRun: {
    id: string;
    jobName: string;
    ranAt: string;
    rowsAffected: number;
    success: boolean;
    errorMessage: string | null;
  } | null;
};

export async function fetchDataIntegrityReport(): Promise<DataIntegrityReport> {
  const res = await fetch(`${API_URL}/superadmin/data-integrity`, {
    credentials: "include",
  });
  return handleResponse<DataIntegrityReport>(res);
}