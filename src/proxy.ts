import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // La landing no pasa por aquí para poder servirse desde caché.
  matcher: ["/admin/:path*"],
};
