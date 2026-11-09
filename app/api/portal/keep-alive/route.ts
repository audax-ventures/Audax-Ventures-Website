import { createClient } from "@supabase/supabase-js";

// Called once a day by Vercel Cron (see vercel.json) so the free Supabase
// project sees activity and never pauses.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return Response.json({ ok: false, error: "Supabase is not configured" }, { status: 500 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("portal_keepalive");
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, at: data });
}
