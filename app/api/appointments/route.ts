import { NextResponse } from "next/server";
import { createAppointment, formatLongDate, validate } from "@/lib/booking";
import { doctors, services } from "@/lib/clinic";

export async function POST(request: Request) {
  let body: Record<string, string>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const errors = validate(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const appointment = createAppointment({
    serviceId: body.serviceId,
    doctorId: body.doctorId,
    date: body.date,
    time: body.time,
    fullName: body.fullName.trim(),
    phone: body.phone.trim(),
    email: body.email.trim(),
    note: (body.note ?? "").trim(),
  });

  return NextResponse.json(
    {
      code: appointment.code,
      summary: {
        service: services.find((s) => s.id === appointment.serviceId)?.title ?? "",
        doctor: doctors.find((d) => d.id === appointment.doctorId)?.name ?? "",
        date: formatLongDate(appointment.date),
        time: appointment.time,
      },
    },
    { status: 201 },
  );
}
