import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  // RLS ensures only the owner or an admin can actually cancel this row.
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json();
  const allowed = ["title", "start_time", "end_time", "room_id"] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) patch[key] = body[key];

  const { data, error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", params.id)
    .select("*, room:rooms(*), organizer:profiles(*)")
    .single();

  if (error) {
    if (error.code === "23P01") {
      return NextResponse.json({ error: "Ce créneau est déjà réservé." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}
