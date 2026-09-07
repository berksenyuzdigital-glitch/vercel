import { NextResponse } from "next/server";
import { getSlots, isValidDate } from "@/lib/booking";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";
  const doctorId = searchParams.get("doctor") ?? "";
  const serviceId = searchParams.get("service") ?? "";

  if (!isValidDate(date)) {
    return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
  }

  const slots = getSlots(date, doctorId, serviceId);

  return NextResponse.json({
    date,
    closed: slots.length === 0,
    slots,
  });
}
