import { Outlet } from "react-router";

export function StorefrontLayout() {
  return (
    <div className="storefront-theme">
      <Outlet />
    </div>
  );
}