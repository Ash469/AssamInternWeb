import { notFound } from "next/navigation";
import SuperAdminLoginPortal from "./SuperAdminLoginPortal";

export const dynamic = "force-dynamic";

export default async function SecretSuperAdminPage({
  params,
}: {
  params: Promise<{ superAdminSecret: string }>;
}) {
  const { superAdminSecret } = await params;
  const configuredSecret = process.env.SUPER_ADMIN_SECRET_PATH || "superadmin-command-hq";

  // Security Gate 1: If browser URL does not match SUPER_ADMIN_SECRET_PATH from .env, trigger 404
  if (superAdminSecret !== configuredSecret) {
    notFound();
  }

  // Security Gate 2: Render the secret Super Admin credentials portal
  return <SuperAdminLoginPortal secretPath={configuredSecret} />;
}
