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
  const requestedClientNumber = typeof values.clientNumber === "string" ? values.clientNumber.trim() : "";
  const fullName = typeof values.fullName === "string" ? values.fullName.trim() : "";
  const phone = typeof values.phone === "string" ? values.phone.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";

  if (!fullName) {
    return NextResponse.json({ error: "Client name is required." }, { status: 400 });
  }
  if (requestedClientNumber && !/^[A-Za-z0-9][A-Za-z0-9_-]{0,29}$/.test(requestedClientNumber)) {
    return NextResponse.json({ error: "Client number must be 1 to 30 letters, numbers, hyphens, or underscores." }, { status: 400 });
  }
  if (fullName.length > 120 || phone.length > 40 || email.length > 254) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }
  if (phone && !isValidPhoneNumber(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number with 7 to 15 digits." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const client = createClient({
    clientNumber: requestedClientNumber || null,
    fullName,
    phone,
    email: email || null,
  });
  if (!client) {
    return NextResponse.json({ error: "That client number is already in use." }, { status: 409 });
  }

  return NextResponse.json({ client }, { status: 201 });
}
