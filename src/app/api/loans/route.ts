import { NextResponse } from "next/server";
import { clientExists, createLoan, listLoans, parseAmount } from "@/lib/loans";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ loans: listLoans() });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Enter the loan details and try again." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const clientNumber = typeof values.clientNumber === "string" ? values.clientNumber.trim() : "";
  const principalAmount = parseAmount(values.principalAmount);
  const totalDue = parseAmount(values.totalDue);

  if (!clientNumber) {
    return NextResponse.json({ error: "Choose a client for this loan." }, { status: 400 });
  }
  if (!clientExists(clientNumber)) {
    return NextResponse.json({ error: "That client could not be found. Refresh and choose a client again." }, { status: 404 });
  }
  if (principalAmount === null || principalAmount <= 0) {
    return NextResponse.json({ error: "Enter a loan amount greater than zero, with up to two decimal places." }, { status: 400 });
  }
  if (totalDue === null || totalDue <= 0) {
    return NextResponse.json({ error: "Enter the total amount due, with up to two decimal places." }, { status: 400 });
  }
  if (totalDue < principalAmount) {
    return NextResponse.json({ error: "Total amount due must be at least the original loan amount." }, { status: 400 });
  }

  const loan = createLoan({ clientNumber, principalAmount, totalDue });
  return NextResponse.json({ loan }, { status: 201 });
}
