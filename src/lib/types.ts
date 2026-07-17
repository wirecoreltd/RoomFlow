export type Role = "user" | "admin";
export type Language = "fr" | "en";
export type Company = {
  id: string;
  name: string;
  created_at: string;
};
export type Profile = {
  id: string;
  company_id: string;
  email: string;
  full_name: string | null;
  role: Role;
  language: Language;
  created_at: string;
};
export type ResourceType = "room" | "desk" | "parking" | "vehicle" | "equipment" | "other";
export type Resource = {
  id: string;
  company_id: string;
  type: ResourceType;
  name: string;
  capacity: number | null;
  location: string | null;
  equipment: string[];
  color: string;
  opening_time: string; // "08:00:00"
  closing_time: string; // "23:00:00"
  is_active: boolean;
  custom_type: string | null; // ← libellé libre quand type === "other"
  created_at: string;
};
export type BookingStatus = "confirmed" | "cancelled";
export type Booking = {
  id: string;
  resource_id: string;
  company_id: string;
  user_id: string;
  title: string;
  start_time: string; // ISO
  end_time: string; // ISO
  status: BookingStatus;
  created_at: string;
  resource?: Resource;
  organizer?: Profile;
};
