export function tripTitle(trip = {}) {
  if (trip.origin && trip.destination) return `${trip.origin} to ${trip.destination}`;
  return trip.destination || trip.origin || "Your trip";
}

export const planFilename = (trip) =>
  `Displacement - ${tripTitle(trip)}.pdf`.replace(/[\\/:*?"<>|]/g, "");

export function tripFacts(trip = {}) {
  const facts = [];
  if (trip.start_date && trip.end_date) facts.push(`${trip.start_date} → ${trip.end_date}`);
  else if (trip.start_date) facts.push(`From ${trip.start_date}`);
  if (trip.duration_days) facts.push(`${trip.duration_days} days`);
  if (trip.travelers) facts.push(`${trip.travelers} traveller${trip.travelers > 1 ? "s" : ""}`);
  if (trip.budget) facts.push(`Budget ${trip.budget}`);
  return facts;
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  });

export function initials(user) {
  const src = (user?.full_name || user?.email || "?").trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[1][0] : "")).toUpperCase();
}

export const AGENT_LABELS = {
  flight: "Flights",
  hotel: "Hotels",
  weather: "Weather",
  budget: "Budget",
  itinerary: "Itinerary",
};