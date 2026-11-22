import type {
  Airport,
  Group,
  GroupMember,
  Notification,
  Quote,
  TravelRequest,
  User,
} from "@/types";
import { ApiError, tokenStore } from "./api";

const A = (iata: string, name: string, city: string): Airport => ({
  id: `ap_${iata}`,
  iata_code: iata,
  airport_name: name,
  city,
  country: "India",
});

export const airports: Airport[] = [
  A("BLR", "Kempegowda International", "Bengaluru"),
  A("DEL", "Indira Gandhi International", "New Delhi"),
  A("BOM", "Chhatrapati Shivaji Maharaj International", "Mumbai"),
  A("HYD", "Rajiv Gandhi International", "Hyderabad"),
  A("MAA", "Chennai International", "Chennai"),
  A("CCU", "Netaji Subhas Chandra Bose International", "Kolkata"),
  A("PNQ", "Pune Airport", "Pune"),
  A("GOI", "Dabolim Airport", "Goa"),
  A("GOX", "Manohar International", "North Goa"),
  A("AMD", "Sardar Vallabhbhai Patel International", "Ahmedabad"),
  A("JAI", "Jaipur International", "Jaipur"),
  A("LKO", "Chaudhary Charan Singh International", "Lucknow"),
  A("COK", "Cochin International", "Kochi"),
  A("TRV", "Trivandrum International", "Thiruvananthapuram"),
  A("GAU", "Lokpriya Gopinath Bordoloi International", "Guwahati"),
  A("IXC", "Chandigarh International", "Chandigarh"),
  A("PAT", "Jay Prakash Narayan International", "Patna"),
  A("BBI", "Biju Patnaik International", "Bhubaneswar"),
  A("NAG", "Dr. Babasaheb Ambedkar International", "Nagpur"),
  A("IDR", "Devi Ahilya Bai Holkar", "Indore"),
  A("SXR", "Sheikh ul-Alam International", "Srinagar"),
  A("IXB", "Bagdogra Airport", "Siliguri"),
  A("VNS", "Lal Bahadur Shastri International", "Varanasi"),
  A("IXZ", "Veer Savarkar International", "Port Blair"),
  A("CJB", "Coimbatore International", "Coimbatore"),
  A("IXM", "Madurai Airport", "Madurai"),
];
export const ap = (iata: string) => airports.find((a) => a.iata_code === iata)!;

export const users: (User & { password: string })[] = [
  {
    id: "u_trav",
    full_name: "Aarav Sharma",
    email: "traveller@demo.com",
    role: "traveller",
    password: "demo1234",
  },
  {
    id: "u_admin",
    full_name: "Priya Nair",
    email: "admin@demo.com",
    role: "admin",
    password: "demo1234",
  },
];

const d = (offsetDays: number) => {
  const x = new Date();
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() + offsetDays);
  return x.toISOString().slice(0, 10);
};
const mkGroup = (
  id: string,
  o: string,
  de: string,
  off: number,
  filled: number,
  max: number,
  status: Group["status"],
): Group => ({
  id,
  route: `${o}-${de}`,
  origin: ap(o),
  destination: ap(de),
  target_date: d(off),
  window_start: d(off - 2),
  window_end: d(off + 2),
  seats_filled: filled,
  max_seats: max,
  min_seats_for_quote: 10,
  status,
  quote_deadline: status === "quote_requested" ? d(5) : null,
  created_at: d(-10),
});

export const groups: Group[] = [
  mkGroup("g_1", "BLR", "DEL", 21, 14, 30, "quoted"),
  mkGroup("g_2", "BOM", "GOI", 18, 6, 20, "forming"),
  mkGroup("g_3", "DEL", "BOM", 30, 22, 30, "quoted"),
  mkGroup("g_4", "HYD", "BLR", 14, 11, 25, "quote_requested"),
  mkGroup("g_5", "MAA", "CCU", 40, 4, 20, "forming"),
  mkGroup("g_6", "BLR", "DEL", 35, 30, 30, "closed"),
  mkGroup("g_7", "PNQ", "JAI", 26, 9, 18, "forming"),
  mkGroup("g_8", "COK", "DEL", 24, 18, 24, "quoted"),
  mkGroup("g_9", "AMD", "BLR", 45, 2, 20, "forming"),
  mkGroup("g_10", "LKO", "BOM", 28, 12, 20, "quotation_eligible"),
];

export const requests: TravelRequest[] = [
  {
    id: "r_1",
    user_id: "u_trav",
    origin_id: "ap_BLR",
    destination_id: "ap_DEL",
    departure_date: d(21),
    flexibility_days: 2,
    passenger_count: 3,
    max_budget: 6500,
    status: "grouped",
    group_id: "g_1",
    created_at: d(-6),
  },
  {
    id: "r_2",
    user_id: "u_trav",
    origin_id: "ap_BOM",
    destination_id: "ap_GOI",
    departure_date: d(19),
    flexibility_days: 3,
    passenger_count: 2,
    max_budget: null,
    status: "open",
    group_id: null,
    created_at: d(-2),
  },
];

export const members: GroupMember[] = [
  {
    travel_request_id: "r_1",
    user_id: "u_trav",
    display_name: "Aarav S.",
    passenger_count: 3,
    joined_at: d(-5),
  },
  {
    travel_request_id: "r_x1",
    user_id: "u_x1",
    display_name: "Meera K.",
    passenger_count: 4,
    joined_at: d(-8),
  },
  {
    travel_request_id: "r_x2",
    user_id: "u_x2",
    display_name: "Rohan P.",
    passenger_count: 2,
    joined_at: d(-7),
  },
  {
    travel_request_id: "r_x3",
    user_id: "u_x3",
    display_name: "Ishita G.",
    passenger_count: 5,
    joined_at: d(-4),
  },
].map((m) => ({ ...m, group_id: "g_1" }));

export const quotes: Quote[] = [
  {
    id: "q_6",
    group_id: "g_1",
    airline_name: "IndiGo",
    price_per_passenger: 5180,
    available_seats: 30,
    source_type: "simulated",
    baggage_details: "15 kg check-in, 7 kg cabin",
    terms: "Illustrative group fare.",
    valid_until: d(7),
    status: "published",
  },
  {
    id: "q_7",
    group_id: "g_1",
    airline_name: "Air India",
    price_per_passenger: 5640,
    available_seats: 20,
    source_type: "manual",
    baggage_details: "25 kg check-in, meal included",
    terms: "Indicative group quote entered by admin.",
    valid_until: d(10),
    status: "published",
  },
  {
    id: "q_1",
    group_id: "g_3",
    airline_name: "IndiGo",
    price_per_passenger: 4850,
    available_seats: 30,
    source_type: "simulated",
    baggage_details: "15 kg check-in, 7 kg cabin",
    terms: "Group fare, name changes up to 7 days before departure.",
    valid_until: d(6),
    status: "published",
  },
  {
    id: "q_2",
    group_id: "g_3",
    airline_name: "Air India",
    price_per_passenger: 5320,
    available_seats: 25,
    source_type: "manual",
    baggage_details: "25 kg check-in, 8 kg cabin, meal included",
    terms: "Indicative group quote. Subject to availability at confirmation.",
    valid_until: d(9),
    status: "published",
  },
  {
    id: "q_3",
    group_id: "g_3",
    airline_name: "Akasa Air",
    price_per_passenger: 4590,
    available_seats: 30,
    source_type: "simulated",
    baggage_details: "15 kg check-in, 7 kg cabin",
    terms: "Illustrative fare.",
    valid_until: d(-1),
    status: "expired",
  },
  {
    id: "q_4",
    group_id: "g_8",
    airline_name: "Vistara",
    price_per_passenger: 6100,
    available_seats: 24,
    source_type: "manual",
    baggage_details: "20 kg check-in, 7 kg cabin",
    terms: "Indicative group quote entered by admin.",
    valid_until: d(4),
    status: "published",
  },
  {
    id: "q_5",
    group_id: "g_8",
    airline_name: "SpiceJet",
    price_per_passenger: 5450,
    available_seats: 24,
    source_type: "simulated",
    baggage_details: "15 kg check-in",
    terms: "Illustrative fare.",
    valid_until: d(5),
    status: "draft",
  },
];

export const notifications: (Notification & { user_id: string })[] = [
  {
    id: "n_1",
    user_id: "u_trav",
    title: "Group reached quote threshold",
    message:
      "BLR → DEL on your dates now has 14 seats filled. An admin can request airline quotes.",
    read: false,
    created_at: d(-1),
    link: "/groups/g_1",
  },
  {
    id: "n_2",
    user_id: "u_trav",
    title: "New match found",
    message: "Your BOM → GOI request matches a forming group.",
    read: false,
    created_at: d(-2),
    link: "/discover",
  },
  {
    id: "n_3",
    user_id: "u_trav",
    title: "Welcome to FlyTogether",
    message: "Publish a flight requirement to start finding co-travellers.",
    read: true,
    created_at: d(-9),
  },
  {
    id: "n_4",
    user_id: "u_admin",
    title: "2 groups awaiting quotes",
    message: "BLR → DEL and LKO → BOM crossed the seat threshold.",
    read: false,
    created_at: d(-1),
    link: "/admin/groups",
  },
];

export const mockToken = (u: User) => `mock.${u.id}`;
export function currentUser(): User {
  const t = tokenStore.get();
  const u = users.find((x) => t === `mock.${x.id}`);
  if (!u) throw new ApiError(401, "Not authenticated");
  const { password: _p, ...safe } = u;
  return safe;
}
export function requireAdmin(): User {
  const u = currentUser();
  if (u.role !== "admin") throw new ApiError(403, "Admin access required");
  return u;
}
export const today = () => d(0);
export const uid = (p: string) =>
  `${p}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
export const hydrateRequest = (r: TravelRequest): TravelRequest => ({
  ...r,
  origin: airports.find((a) => a.id === r.origin_id),
  destination: airports.find((a) => a.id === r.destination_id),
});
