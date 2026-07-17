import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("resources").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const body = await request.json();
  const { type, name, capacity, location, equipment, color, opening_time, closing_time } = body ?? {};

  if (!name || !type) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("resources")
    .insert({
      company_id: profile.company_id,
      type,
      name,
      capacity: capacity ?? null,
      location: location || null,
      equipment: equipment ?? [],
      color: color || "#0E7C7B",
      opening_time: opening_time || "08:00",
      closing_time: closing_time || "23:00",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
