import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseAmount } from "@/lib/loans";
import { getRepaymentHistory, recordRepayment } from "@/lib/repayments";

export const runtime = "nodejs";

export function GET(request: Request) {
  const loanNumber = new URL(request.url).searchParams.get("loanNumber")?.trim() ?? "";
  if (!loanNumber) {
    return NextResponse.json({ error: "Choose a loan to view its repayment history." }, { status: 400 });
  }

  const history = getRepaymentHistory(db, loanNumber);
  if (!history) return NextResponse.json({ error: "Loan not found." }, { status: 404 });

  return NextResponse.json({ history });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Enter the repayment details and try again." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const loanNumber = typeof values.loanNumber === "string" ? values.loanNumber.trim() : "";
  const paymentReference = typeof values.paymentReference === "string" ? values.paymentReference.trim() : "";
  const amount = parseAmount(values.amount);

  if (!loanNumber) {
    return NextResponse.json({ error: "Choose a loan for this repayment." }, { status: 400 });
  }
  if (!paymentReference) {
    return NextResponse.json({ error: "Enter the payment reference." }, { status: 400 });
  }
  if (paymentReference.length > 100) {
    return NextResponse.json({ error: "Payment reference must be 100 characters or fewer." }, { status: 400 });
  }
  if (amount === null || amount <= 0) {
    return NextResponse.json({ error: "Enter a repayment greater than zero, with up to two decimal places." }, { status: 400 });
  }

  const result = recordRepayment(db, { loanNumber, paymentReference, amount });
  if (!result.ok) {
    if (result.reason === "invalid_amount") {
      return NextResponse.json({ error: "Repayment must be greater than zero." }, { status: 400 });
    }
    if (result.reason === "loan_not_found") {
      return NextResponse.json({ error: "Loan not found. Refresh and choose a loan again." }, { status: 404 });
    }
    if (result.reason === "duplicate_reference") {
      return NextResponse.json({ error: "That payment reference has already been recorded." }, { status: 409 });
    }
    return NextResponse.json({ error: "Repayment cannot be greater than the outstanding balance." }, { status: 400 });
  }

  return NextResponse.json({ repayment: result.repayment }, { status: 201 });
}
