import { doctors, services } from "./clinic";

export type Slot = { time: string; available: boolean };

export type Appointment = {
  code: string;
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  fullName: string;
  phone: string;
  email: string;
  note?: string;
  createdAt: string;
};

/**
 * Demo veri deposu. Süreç ömrü boyunca bellekte tutulur; gerçek dağıtımda
 * bir veritabanı (Postgres/Supabase) ile değiştirilmesi beklenir.
 */
const store = new Map<string, Appointment>();

const OPENING: Record<number, [number, number] | null> = {
  0: null, // Pazar
  1: [9, 19],
  2: [9, 19],
  3: [9, 19],
  4: [9, 19],
  5: [9, 19],
  6: [10, 16], // Cumartesi
};

export const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seeded(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 1000) / 1000;
}

/** Takvim yoğunluğunu taklit eden, tarih+hekim için deterministik dolu saatler. */
function isReserved(date: string, doctorId: string, time: string) {
  return seeded(`${date}|${doctorId}|${time}`) < 0.34;
}

export function getSlots(date: string, doctorId: string, serviceId: string): Slot[] {
  if (!isValidDate(date)) return [];

  const day = new Date(`${date}T00:00:00`);
  const window = OPENING[day.getDay()];
  if (!window) return [];

  const service = services.find((s) => s.id === serviceId);
  const stepMinutes = service && service.duration >= 60 ? 60 : 30;

  const [open, close] = window;
  const now = new Date();
  const slots: Slot[] = [];

  for (let minutes = open * 60; minutes + stepMinutes <= close * 60; minutes += stepMinutes) {
    const hh = `${Math.floor(minutes / 60)}`.padStart(2, "0");
    const mm = `${minutes % 60}`.padStart(2, "0");
    const time = `${hh}:${mm}`;

    const isPast = new Date(`${date}T${time}:00`).getTime() < now.getTime() + 2 * 60 * 60 * 1000;
    const taken = [...store.values()].some(
      (a) => a.date === date && a.time === time && a.doctorId === doctorId,
    );

    slots.push({
      time,
      available: !isPast && !taken && !isReserved(date, doctorId, time),
    });
  }

  return slots;
}

export type BookingInput = Partial<Record<keyof Appointment, string>>;

export function validate(input: BookingInput) {
  const errors: Record<string, string> = {};
  const name = (input.fullName ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim();

  if (name.length < 3) errors.fullName = "Lütfen ad ve soyadınızı yazın.";
  if (phone.replace(/\D/g, "").length < 10) errors.phone = "Geçerli bir telefon numarası girin.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Geçerli bir e-posta adresi girin.";
  if (!services.some((s) => s.id === input.serviceId)) errors.serviceId = "Bir tedavi seçin.";
  if (!doctors.some((d) => d.id === input.doctorId)) errors.doctorId = "Bir hekim seçin.";
  if (!input.date || !isValidDate(input.date)) errors.date = "Bir tarih seçin.";
  if (!input.time || !/^\d{2}:\d{2}$/.test(input.time)) errors.time = "Bir saat seçin.";

  if (!errors.date && !errors.time && !errors.doctorId && !errors.serviceId) {
    const slot = getSlots(input.date!, input.doctorId!, input.serviceId!).find(
      (s) => s.time === input.time,
    );
    if (!slot || !slot.available) errors.time = "Bu saat az önce doldu, başka bir saat seçin.";
  }

  return errors;
}

function makeCode() {
  const letters = "ABCDEFGHJKLMNPRSTUVYZ";
  let code = "";
  for (let i = 0; i < 3; i += 1) code += letters[Math.floor(Math.random() * letters.length)];
  return `AUR-${code}${Math.floor(100 + Math.random() * 900)}`;
}

export function createAppointment(input: Required<Omit<Appointment, "code" | "createdAt">>) {
  const appointment: Appointment = {
    ...input,
    code: makeCode(),
    createdAt: new Date().toISOString(),
  };
  store.set(appointment.code, appointment);
  return appointment;
}

export const formatLongDate = (date: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
