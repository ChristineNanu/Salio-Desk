import { db } from "@/lib/db";

export type Client = {
  clientNumber: string;
  fullName: string;
  phone: string;
  email: string | null;
  createdAt: string;
};

type ClientRow = {
  client_number: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
};

function toClient(row: ClientRow): Client {
  return {
    clientNumber: row.client_number,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
  };
}

export function listClients(): Client[] {
  const rows = db
    .prepare("SELECT client_number, full_name, phone, email, created_at FROM clients ORDER BY id DESC")
    .all() as ClientRow[];

  return rows.map(toClient);
}

export function createClient(input: {
  clientNumber: string | null;
  fullName: string;
  phone: string;
  email: string | null;
}): Client | null {
  const create = db.transaction(() => {
    const sequence = db.prepare("SELECT seq FROM sqlite_sequence WHERE name = 'clients'")
      .get() as { seq: number } | undefined;
    let clientNumber = input.clientNumber;

    if (!clientNumber) {
      let nextNumber = (sequence?.seq ?? 0) + 1;
      do {
        clientNumber = `CL-${String(nextNumber).padStart(5, "0")}`;
        nextNumber += 1;
      } while (db.prepare("SELECT 1 FROM clients WHERE client_number = ?").get(clientNumber));
    }

    const existing = db.prepare("SELECT 1 FROM clients WHERE client_number = ?").get(clientNumber);
    if (existing) return null;

    const result = db.prepare(`
      INSERT INTO clients (client_number, full_name, phone, email) VALUES (?, ?, ?, ?)
    `).run(clientNumber, input.fullName, input.phone, input.email);

    return db
      .prepare("SELECT client_number, full_name, phone, email, created_at FROM clients WHERE id = ?")
      .get(result.lastInsertRowid) as ClientRow;
  });

  const row = create.immediate();
  return row ? toClient(row) : null;
}
