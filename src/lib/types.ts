export type Role = "user" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
};

export type Room = {
  id: string;
  site_id: string;
  name: string;
  capacity: number;
  location: string | null;
  equipment: string[];
  color: string;
  opening_time: string; // "08:00:00"
  closing_time: string; // "19:00:00"
  is_active: boolean;
  created_at: string;
};

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  start_time: string; // ISO
  end_time: string; // ISO
  status: BookingStatus;
  created_at: string;
  // jointures optionnelles renvoyees par l'API
  room?: Room;
  organizer?: Profile;
};
