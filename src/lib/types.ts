export type ResourceType =
  | "room"
  | "desk"
  | "parking"
  | "vehicle"
  | "equipment"
  | "printer"
  | "tv"
  | "projector"
  | "other";

export type CustomType = {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
};

export type Resource = {
  id: string;
  company_id: string;
  type: ResourceType;
  name: string;
  capacity: number | null;
  location: string | null;
  equipment: string[];
  color: string;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  custom_type: string | null;
  created_at: string;
};
