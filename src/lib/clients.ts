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

export function createClient(input: { fullName: string; phone: string; email: string | null }): Client {
  const create = db.transaction(() => {
    const result = db
      .prepare("INSERT INTO clients (client_number, full_name, phone, email) VALUES ('pending', ?, ?, ?)")
      .run(input.fullName, input.phone, input.email);
    const clientNumber = `CL-${String(result.lastInsertRowid).padStart(5, "0")}`;

    db.prepare("UPDATE clients SET client_number = ? WHERE id = ?").run(clientNumber, result.lastInsertRowid);

    return db
      .prepare("SELECT client_number, full_name, phone, email, created_at FROM clients WHERE id = ?")
      .get(result.lastInsertRowid) as ClientRow;
  });

  return toClient(create());
}
