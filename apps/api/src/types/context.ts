export type AppUser = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: string;
};

export type Variables = {
  user: AppUser | null;
  tenantId: string | null;
};