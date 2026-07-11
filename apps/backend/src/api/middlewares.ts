import { defineMiddlewares } from "@medusajs/medusa";
import { requireRole } from "./middlewares/require-role";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/store*",
      method: ["POST", "PUT", "DELETE"],
      middlewares: [requireRole("super_admin")],
    },
    {
      matcher: "/admin/api-keys*",
      method: ["POST", "PUT", "DELETE"],
      middlewares: [requireRole("super_admin")],
    },
    {
      matcher: "/admin/regions*",
      method: ["POST", "PUT", "DELETE"],
      middlewares: [requireRole("super_admin")],
    },
    {
      matcher: "/admin/payment-providers*",
      method: ["POST", "PUT", "DELETE"],
      middlewares: [requireRole("super_admin")],
    },
    {
      matcher: "/admin/settings*",
      method: ["POST", "PUT", "DELETE"],
      middlewares: [requireRole("super_admin")],
    },
  ],
});
