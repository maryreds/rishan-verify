import { cookies } from "next/headers";

export const ADMIN_COOKIE = "vouch_admin_pw";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "mermelada";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_COOKIE)?.value;
  return !!cookieValue && cookieValue === getAdminPassword();
}
