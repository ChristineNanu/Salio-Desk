"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Client } from "@/lib/clients";

export function ClientDirectory() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadClients() {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok) throw new Error("Could not load clients.");
        const data: { clients: Client[] } = await response.json();
        setClients(data.clients);
      } catch {
        setError("Could not load clients. Refresh the page to try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadClients();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientNumber: values.get("clientNumber"),
          fullName: values.get("fullName"),
          phone: values.get("phone"),
          email: values.get("email"),
        }),
      });
      const data: { client?: Client; error?: string } = await response.json();
      const newClient = data.client;
      if (!response.ok || !newClient) throw new Error(data.error ?? "Could not save this client.");

      setClients((current) => [newClient, ...current]);
      setSuccess(`${newClient.clientNumber} added successfully.`);
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this client.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="welcome-row">
        <div><p className="eyebrow">CLIENT RECORDS</p><h1>Clients</h1><p className="welcome-copy">Register clients and keep their contact details in one place.</p></div>
      </div>

      <div className="client-layout">
        <section className="client-form-card" aria-labelledby="new-client-heading">
          <div className="section-heading"><div><h2 id="new-client-heading">Add a client</h2><p>Enter a client number, or leave blank to assign one.</p></div></div>
          <form className="client-form" onSubmit={handleSubmit}>
            <label htmlFor="clientNumber">Client number <small>Optional</small></label>
            <input id="clientNumber" name="clientNumber" maxLength={30} placeholder="e.g. CL-001 (leave blank to assign)" />

            <label htmlFor="fullName">Full name <span>*</span></label>
            <input id="fullName" name="fullName" autoComplete="name" maxLength={120} required placeholder="e.g. Amina Njeri" />

            <label htmlFor="phone">Phone number <small>Optional</small></label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={24} pattern="[+0-9 ]{7,24}" title="Use 7 to 15 digits. Spaces and a leading + are allowed." placeholder="e.g. +254 712 345 678" />

            <label htmlFor="email">Email address <small>Optional</small></label>
            <input id="email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="e.g. amina@example.com" />

            {error && <p className="form-message error-message" role="alert">{error}</p>}
            {success && <p className="form-message success-message" role="status">{success}</p>}
            <button className="primary-button form-submit" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "＋ Add client"}</button>
          </form>
        </section>

        <section className="client-list-card" aria-labelledby="client-list-heading">
          <div className="section-heading"><div><h2 id="client-list-heading">All clients <span className="count-pill">{clients.length}</span></h2><p>Client records saved on this desk</p></div></div>
          {isLoading ? <p className="list-placeholder">Loading clients…</p> : clients.length === 0 ? (
            <div className="list-empty"><span className="list-empty-icon">♙</span><strong>No clients yet</strong><p>Add your first client using the form.</p></div>
          ) : (
            <ul className="client-list">
              {clients.map((client) => (
                <li className="client-row" key={client.clientNumber}>
                  <span className="client-avatar">{client.fullName.trim().charAt(0).toUpperCase()}</span>
                  <span className="client-details"><strong>{client.fullName}</strong><small>{[client.phone, client.email].filter(Boolean).join(" · ") || "No contact details"}</small></span>
                  <span className="client-number">{client.clientNumber}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
