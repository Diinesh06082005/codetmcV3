export const isAdminUser = (user) => user?.role === "admin";

export const getDefaultAuthenticatedRoute = (user) =>
  isAdminUser(user) ? "/admin" : "/dashboard";
