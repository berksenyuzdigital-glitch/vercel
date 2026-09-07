"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clinic, doctors, services } from "@/lib/clinic";
import { BOOKING_EVENT, type BookingSelection } from "@/lib/events";

type Slot = { time: string; available: boolean };

const STEPS = ["Tedavi", "Hekim", "Tarih & Saat", "Bilgiler"];

/** Tedaviye göre öne çıkarılan hekimler; diğer hekimler yine seçilebilir. */
const RECOMMENDED: Record<string, string[]> = {
  "gulus-tasarimi": ["dr-elif-narin"],
  implant: ["dr-kaan-aksoy"],
  "seffaf-plak": ["dr-sena-yildiz"],
  "estetik-dolgu": ["dr-elif-narin"],
  beyazlatma: ["dr-elif-narin"],
  "cocuk-dis": ["dr-mert-oral"],
};

function nextDays(count: number) {
  return [...Array(count)].map((_, i) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + i);
    return {
      iso: `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`,
      day: date.toLocaleDateString("tr-TR", { weekday: "short" }),
      num: date.getDate(),
      month: date.toLocaleDateString("tr-TR", { month: "short" }),
      closed: date.getDay() === 0,
      isToday: i === 0,
    };
  });
}

export default function Booking() {
  const days = useMemo(() => nextDays(28), []);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", note: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    summary: { service: string; doctor: string; date: string; time: string };
  } | null>(null);

  const panel = useRef<HTMLDivElement>(null);

  /* Diğer bölümlerden gelen ön seçimleri yakalar. */
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<BookingSelection>).detail ?? {};
      if (detail.serviceId) {
        setServiceId(detail.serviceId);
        setStep((current) => Math.max(current, 1));
      }
      if (detail.doctorId) {
        setDoctorId(detail.doctorId);
        setStep((current) => Math.max(current, 2));
      }
      setResult(null);
    };
    window.addEventListener(BOOKING_EVENT, handler);
    return () => window.removeEventListener(BOOKING_EVENT, handler);
  }, []);

  /* Seçim değiştikçe uygun saatleri sunucudan tazeler. */
  useEffect(() => {
    if (!date || !doctorId || !serviceId) {
      setSlots([]);
      return;
    }
    const controller = new AbortController();
    setLoadingSlots(true);
    setTime("");

    fetch(`/api/availability?date=${date}&doctor=${doctorId}&service=${serviceId}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { slots?: Slot[] }) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));

    return () => controller.abort();
  }, [date, doctorId, serviceId]);

  const canContinue = [Boolean(serviceId), Boolean(doctorId), Boolean(date && time), consent][step];

  const goTo = useCallback((next: number) => {
    setStep(next);
    panel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const submit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, doctorId, date, time, ...form }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? { form: "Randevu oluşturulamadı, lütfen tekrar deneyin." });
        if (data.errors?.time) goTo(2);
        return;
      }
      setResult(data);
    } catch {
      setErrors({ form: "Bağlantı kurulamadı. Lütfen tekrar deneyin." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const selectedDay = days.find((d) => d.iso === date);

  return (
    <section id="randevu" data-nav="dark" className="bg-forest py-24 text-bone md:py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b hairline-light pb-8">
          <div>
            <p className="eyebrow text-mint/60" data-reveal>
              (08) — Randevu
            </p>
            <h2 className="display fluid-lg mt-6 max-w-2xl" data-reveal>
              Dört adımda, <em className="text-mint">60 saniyede</em>.
            </h2>
          </div>
          <a href={clinic.phoneHref} className="link-line font-mono text-xs uppercase tracking-[0.16em] text-bone/70">
            Telefonla: {clinic.phone}
          </a>
        </div>

        <div className="grid gap-12 pt-12 md:grid-cols-12">
          {/* Özet sütunu */}
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <p className="field-label">Randevu Özeti</p>
              <dl className="mt-6 space-y-4 text-sm">
                {[
                  { k: "Tedavi", v: selectedService?.title, extra: selectedService && `${selectedService.duration} dk` },
                  { k: "Hekim", v: selectedDoctor?.name, extra: selectedDoctor?.role },
                  {
                    k: "Tarih",
                    v: selectedDay && `${selectedDay.num} ${selectedDay.month}`,
                    extra: selectedDay?.day,
                  },
                  { k: "Saat", v: time || undefined, extra: time ? "Nişantaşı kliniği" : undefined },
                ].map((row) => (
                  <div key={row.k} className="flex items-baseline justify-between gap-4 border-b hairline-light pb-3">
                    <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone/45">
                      {row.k}
                    </dt>
                    <dd className="text-right">
                      <span className={row.v ? "text-bone" : "text-bone/30"}>{row.v ?? "—"}</span>
                      {row.extra && row.v && (
                        <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-mint/60">
                          {row.extra}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-8 text-xs leading-relaxed text-bone/45">
                İlk muayene için ön ödeme alınmaz. Randevunuzu 24 saat öncesine kadar ücretsiz
                erteleyebilirsiniz.
              </p>
            </div>
          </aside>

          {/* Sihirbaz */}
          <div className="md:col-span-8" ref={panel}>
            {result ? (
              <div className="rounded-3xl border hairline-light p-8 md:p-12" data-reveal>
                <span className="grid h-14 w-14 place-items-center rounded-full bg-mint text-2xl text-forest">
                  ✓
                </span>
                <h3 className="display mt-8 text-4xl md:text-5xl">Randevunuz alındı.</h3>
                <p className="mt-4 max-w-md text-bone/60">
                  Onay mesajı e-posta ve SMS ile iletildi. Klinik koordinatörümüz seans öncesi
                  hazırlık için sizi arayacak.
                </p>

                <dl className="mt-10 grid gap-6 border-t hairline-light pt-8 sm:grid-cols-2">
                  {[
                    ["Randevu kodu", result.code],
                    ["Tedavi", result.summary.service],
                    ["Hekim", result.summary.doctor],
                    ["Tarih & saat", `${result.summary.date} · ${result.summary.time}`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="field-label">{k}</dt>
                      <dd className="mt-2 text-lg">{v}</dd>
                    </div>
                  ))}
                </dl>

                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setStep(0);
                    setServiceId("");
                    setDoctorId("");
                    setDate("");
                    setTime("");
                    setConsent(false);
                    setForm({ fullName: "", phone: "", email: "", note: "" });
                  }}
                  className="btn btn-light mt-10"
                >
                  Yeni randevu oluştur
                </button>
              </div>
            ) : (
              <>
                {/* Adım göstergesi */}
                <ol className="mb-10 flex flex-wrap gap-x-6 gap-y-3">
                  {STEPS.map((label, i) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => i < step && goTo(i)}
                        disabled={i > step}
                        className={`flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] transition-colors ${
                          i === step ? "text-mint" : i < step ? "text-bone/60 hover:text-bone" : "text-bone/25"
                        }`}
                      >
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full border text-[0.6rem] ${
                            i === step ? "border-mint" : "border-bone/20"
                          }`}
                        >
                          {i < step ? "✓" : `0${i + 1}`}
                        </span>
                        {label}
                      </button>
                    </li>
                  ))}
                </ol>

                {/* 01 — Tedavi */}
                {step === 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setServiceId(service.id);
                          setDoctorId("");
                        }}
                        aria-pressed={serviceId === service.id}
                        className={`rounded-2xl border p-5 text-left transition-all duration-500 ${
                          serviceId === service.id
                            ? "border-mint bg-mint/10"
                            : "border-bone/15 hover:border-bone/40"
                        }`}
                      >
                        <span className="font-mono text-[0.6rem] text-bone/40">{service.index}</span>
                        <span className="display mt-2 block text-2xl">{service.title}</span>
                        <span className="mt-2 block text-sm text-bone/55">{service.short}</span>
                        <span className="mt-4 block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-mint/70">
                          {service.duration} dk · {service.priceFrom}&apos;den
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 02 — Hekim */}
                {step === 1 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[...doctors]
                      .sort((a, b) => {
                        const rec = RECOMMENDED[serviceId] ?? [];
                        return Number(rec.includes(b.id)) - Number(rec.includes(a.id));
                      })
                      .map((doctor) => {
                        const recommended = (RECOMMENDED[serviceId] ?? []).includes(doctor.id);
                        return (
                          <button
                            key={doctor.id}
                            type="button"
                            onClick={() => setDoctorId(doctor.id)}
                            aria-pressed={doctorId === doctor.id}
                            className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-500 ${
                              doctorId === doctor.id
                                ? "border-mint bg-mint/10"
                                : "border-bone/15 hover:border-bone/40"
                            }`}
                          >
                            <span
                              className="display grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl text-forest"
                              style={{ background: doctor.accent }}
                            >
                              {doctor.initials}
                            </span>
                            <span>
                              <span className="block text-lg">{doctor.name}</span>
                              <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-bone/50">
                                {doctor.role}
                              </span>
                              {recommended && (
                                <span className="mt-2 inline-block rounded-full bg-mint/20 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-mint">
                                  Bu tedavi için önerilen
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                )}

                {/* 03 — Tarih & saat */}
                {step === 2 && (
                  <div>
                    <p className="field-label">Gün seçin</p>
                    <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
                      {days.map((day) => (
                        <button
                          key={day.iso}
                          type="button"
                          disabled={day.closed}
                          onClick={() => setDate(day.iso)}
                          aria-pressed={date === day.iso}
                          className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl border py-3 transition-all duration-400 ${
                            date === day.iso
                              ? "border-mint bg-mint text-forest"
                              : day.closed
                                ? "border-bone/10 text-bone/20"
                                : "border-bone/15 text-bone/70 hover:border-bone/45"
                          }`}
                        >
                          <span className="font-mono text-[0.6rem] uppercase">{day.day}</span>
                          <span className="display text-2xl leading-none">{day.num}</span>
                          <span className="font-mono text-[0.55rem] uppercase opacity-70">
                            {day.isToday ? "bugün" : day.month}
                          </span>
                        </button>
                      ))}
                    </div>

                    <p className="field-label mt-10">Saat seçin</p>
                    <div className="mt-4 min-h-[7rem]">
                      {!date && <p className="text-sm text-bone/40">Önce bir gün seçin.</p>}

                      {date && loadingSlots && (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-12 animate-pulse rounded-xl bg-bone/10" />
                          ))}
                        </div>
                      )}

                      {date && !loadingSlots && slots.length === 0 && (
                        <p className="text-sm text-bone/50">
                          Bu gün klinik kapalı. Lütfen başka bir gün seçin.
                        </p>
                      )}

                      {date && !loadingSlots && slots.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {slots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setTime(slot.time)}
                              aria-pressed={time === slot.time}
                              className={`rounded-xl border py-3 font-mono text-sm transition-all duration-300 ${
                                time === slot.time
                                  ? "border-mint bg-mint text-forest"
                                  : slot.available
                                    ? "border-bone/15 text-bone/80 hover:border-bone/45"
                                    : "border-bone/5 text-bone/20 line-through"
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.time && <p className="mt-4 text-sm text-clay">{errors.time}</p>}
                    </div>
                  </div>
                )}

                {/* 04 — Bilgiler */}
                {step === 3 && (
                  <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                    {[
                      { key: "fullName", label: "Ad Soyad", type: "text", placeholder: "Deniz Aksoy", auto: "name" },
                      { key: "phone", label: "Telefon", type: "tel", placeholder: "0555 000 00 00", auto: "tel" },
                      { key: "email", label: "E-posta", type: "email", placeholder: "deniz@ornek.com", auto: "email" },
                    ].map((field) => (
                      <div key={field.key} className={field.key === "email" ? "sm:col-span-2" : ""}>
                        <label className="field-label" htmlFor={field.key}>
                          {field.label}
                        </label>
                        <input
                          id={field.key}
                          name={field.key}
                          type={field.type}
                          autoComplete={field.auto}
                          placeholder={field.placeholder}
                          value={form[field.key as keyof typeof form]}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                          }
                          className="field"
                          aria-invalid={Boolean(errors[field.key])}
                        />
                        {errors[field.key] && (
                          <p className="mt-2 text-xs text-clay">{errors[field.key]}</p>
                        )}
                      </div>
                    ))}

                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="note">
                        Eklemek istediğiniz not (opsiyonel)
                      </label>
                      <textarea
                        id="note"
                        rows={3}
                        value={form.note}
                        onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                        placeholder="Şikâyetiniz, kullandığınız ilaçlar, önceki tedavileriniz…"
                        className="field resize-none"
                      />
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-bone/55 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#a8e6c9]"
                      />
                      <span>
                        Kişisel verilerimin randevu organizasyonu amacıyla işlenmesine ilişkin
                        aydınlatma metnini okudum, onaylıyorum.
                      </span>
                    </label>

                    {errors.form && <p className="text-sm text-clay sm:col-span-2">{errors.form}</p>}
                  </div>
                )}

                {/* Gezinme */}
                <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t hairline-light pt-8">
                  <button
                    type="button"
                    onClick={() => goTo(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-bone/50 transition-colors hover:text-bone disabled:opacity-25"
                  >
                    ← Geri
                  </button>

                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => goTo(step + 1)}
                      disabled={!canContinue}
                      className="btn btn-light"
                    >
                      Devam
                      <span aria-hidden>→</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={!canContinue || submitting}
                      className="btn btn-light"
                    >
                      {submitting ? "Gönderiliyor…" : "Randevuyu Onayla"}
                      <span aria-hidden>↗</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
