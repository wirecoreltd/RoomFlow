import { createClient } from "@/lib/supabase/server";
import ResourcesManager from "@/components/ResourcesManager";
import type { Resource } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const supabase = createClient();
  const { data: resources } = await supabase.from("resources").select("*").order("name");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Gestion des ressources</h1>
        <p className="text-sm text-muted">
          Ajoutez des salles, bureaux, parkings, véhicules ou matériel, et définissez leurs horaires.
        </p>
      </div>
      <ResourcesManager initialResources={(resources as Resource[]) ?? []} />
    </div>
  );
}
