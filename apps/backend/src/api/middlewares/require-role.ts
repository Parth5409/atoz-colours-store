import { MedusaRequest, MedusaNextFunction, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError, MedusaErrorTypes, Modules } from "@medusajs/framework/utils";

export function requireRole(allowedRole: string) {
  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const actorId = (req as any).auth_context?.actor_id;

    if (!actorId) {
      throw new MedusaError(MedusaErrorTypes.NOT_ALLOWED, "Forbidden");
    }

    const userService = req.scope.resolve<any>(Modules.USER);
    const user = await userService.retrieveUser(actorId, { select: ["id", "metadata"] });

    if (!user || !user.metadata || String(user.metadata.role).toLowerCase() !== allowedRole.toLowerCase()) {
      throw new MedusaError(MedusaErrorTypes.NOT_ALLOWED, "Forbidden");
    }

    return next();
  };
}
