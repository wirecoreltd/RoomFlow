import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  let query = supabase
    .from("bookings")
    .select("*, resource:resources(*), organizer:profiles(*)")
    .eq("status", "confirmed")
    .order("start_time");
  if (from) query = query.gte("start_time", from);
  if (to) query = query.lte("start_time", to);
  const { data, error } = await query;
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
    .select("company_id")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 400 });

  const body = await request.json();
  const { resource_id, title, start_time, end_time } = body ?? {};
  if (!resource_id || !title || !start_time || !end_time) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }
  if (new Date(end_time) <= new Date(start_time)) {
    return NextResponse.json({ error: "L'heure de fin doit être après le début." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      resource_id,
      title,
      start_time,
      end_time,
      user_id: user.id,
      company_id: profile.company_id,
    })
    .select("*, resource:resources(*), organizer:profiles(*)")
    .single();

  if (error) {
    if (error.code === "23P01") {
      return NextResponse.json(
        { error: "Ce créneau est déjà réservé pour cette ressource." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
