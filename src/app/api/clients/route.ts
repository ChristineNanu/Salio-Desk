import { NextResponse } from "next/server";
import { createClient, listClients } from "@/lib/clients";
import { isValidPhoneNumber } from "@/lib/validation";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ clients: listClients() });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Enter the client details and try again." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const fullName = typeof values.fullName === "string" ? values.fullName.trim() : "";
  const phone = typeof values.phone === "string" ? values.phone.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";

  if (!fullName || !phone) {
    return NextResponse.json({ error: "Client name and phone number are required." }, { status: 400 });
  }
  if (fullName.length > 120 || phone.length > 40 || email.length > 254) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }
  if (!isValidPhoneNumber(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number with 7 to 15 digits." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const client = createClient({ fullName, phone, email: email || null });
  return NextResponse.json({ client }, { status: 201 });
}
