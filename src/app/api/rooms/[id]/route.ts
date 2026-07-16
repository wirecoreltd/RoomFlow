import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const body = await request.json();
  const allowed = [
    "name",
    "capacity",
    "location",
    "equipment",
    "color",
    "opening_time",
    "closing_time",
    "is_active",
  ] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) patch[key] = body[key];

  const { data, error } = await supabase
    .from("rooms")
    .update(patch)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "42501" ? 403 : 400 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  // Soft-delete: keep history of past bookings intact, just stop showing the room.
  const { error } = await supabase.from("rooms").update({ is_active: false }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "42501" ? 403 : 400 });
  return NextResponse.json({ ok: true });
}
