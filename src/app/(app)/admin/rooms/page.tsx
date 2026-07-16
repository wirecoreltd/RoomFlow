import { createClient } from "@/lib/supabase/server";
import RoomsManager from "@/components/RoomsManager";
import type { Room } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminRoomsPage() {
  const supabase = createClient();
  const { data: rooms } = await supabase.from("rooms").select("*").order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Gestion des salles</h1>
        <p className="text-sm text-muted">Ajoutez des salles, définissez leurs horaires et leur capacité.</p>
      </div>
      <RoomsManager initialRooms={(rooms as Room[]) ?? []} />
    </div>
  );
}
