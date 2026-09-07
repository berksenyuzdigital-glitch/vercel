export type BookingSelection = { serviceId?: string; doctorId?: string };

export const BOOKING_EVENT = "aurea:booking-select";

/** Randevu formunu ön seçimle açar ve bölüme kaydırır. */
export function openBooking(selection: BookingSelection = {}) {
  window.dispatchEvent(new CustomEvent<BookingSelection>(BOOKING_EVENT, { detail: selection }));
  document.getElementById("randevu")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
