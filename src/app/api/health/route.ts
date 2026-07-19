import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("dogs")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503, headers: responseHeaders },
    );
  }

  return NextResponse.json(
    { status: "ok", database: "reachable" },
    { status: 200, headers: responseHeaders },
  );
}
