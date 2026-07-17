import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("custom_types").select("*").order("name");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();
  const name = (body.name as string)?.trim();

  if (!name) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  // Récupère la société de l'utilisateur connecté pour l'insertion
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 400 });
  }

  // upsert : si le type existe déjà pour cette société, ne pas dupliquer
  const { data, error } = await supabase
    .from("custom_types")
    .upsert({ company_id: profile.company_id, name }, { onConflict: "company_id,name" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}
