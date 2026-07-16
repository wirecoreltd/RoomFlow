import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("rooms").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json();
  const { data: site } = await supabase.from("sites").select("id").limit(1).single();

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      site_id: site?.id,
      name: body.name,
      capacity: body.capacity ?? 4,
      location: body.location ?? null,
      equipment: body.equipment ?? [],
      color: body.color ?? "#0E7C7B",
      opening_time: body.opening_time ?? "08:00",
      closing_time: body.closing_time ?? "19:00",
    })
    .select("*")
    .single();

  // RLS blocks non-admins: surfaced as a generic permission error here.
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "42501" ? 403 : 400 });
  return NextResponse.json({ data }, { status: 201 });
}
