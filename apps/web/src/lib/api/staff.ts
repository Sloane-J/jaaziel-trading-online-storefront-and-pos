const API_URL = import.meta.env.VITE_API_URL;

export type StaffRole = "admin" | "cashier" | "staff";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole | "superadmin" | null;
  isActive: boolean;
  createdAt: string;
};

export type CreateStaffInput = {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
};

export type UpdateStaffInput = {
  role?: StaffRole;
  isActive?: boolean;
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

export async function fetchStaff(): Promise<StaffMember[]> {
  const res = await fetch(`${API_URL}/staff`, {
    credentials: "include",
  });
  return handleResponse<StaffMember[]>(res);
}

export async function createStaff(
  input: CreateStaffInput,
): Promise<StaffMember> {
  const res = await fetch(`${API_URL}/staff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<StaffMember>(res);
}

export async function updateStaff(
  id: string,
  input: UpdateStaffInput,
): Promise<StaffMember> {
  const res = await fetch(`${API_URL}/staff/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<StaffMember>(res);
}