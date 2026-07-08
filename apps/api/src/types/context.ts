export type AppUser = {
  id: string;
  email: string;
  role?: string;
  tenantId?: string;
};

export type Variables = {
  user: AppUser | null;
  tenantId: string | null;
};