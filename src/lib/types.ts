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
