import { createClient } from "@/lib/supabase/server";
import ResourcesManager from "@/components/ResourcesManager";
import type { Resource, CustomType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const supabase = createClient();
  const [{ data: resources }, { data: customTypes }] = await Promise.all([
    supabase.from("resources").select("*").order("name"),
    supabase.from("custom_types").select("*").order("name"),
  ]);

  return (
    <ResourcesManager
      initialResources={(resources as Resource[]) ?? []}
      initialCustomTypes={(customTypes as CustomType[]) ?? []}
    />
  );
}
