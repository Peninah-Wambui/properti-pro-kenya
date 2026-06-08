import { useEffect, useState } from "react";
import {
  RENT_RECORDS,
  MAINTENANCE,
  SMS_LOG,
  type RentRecord,
  type MaintenanceRequest,
  type SmsMessage,
} from "./mock-data";
import { subscribe, emit } from "./auth-store";

// In-memory clones so the demo can mutate
let rents: RentRecord[] = RENT_RECORDS.map((r) => ({ ...r }));
let maintenance: MaintenanceRequest[] = MAINTENANCE.map((m) => ({ ...m }));
let sms: SmsMessage[] = SMS_LOG.map((s) => ({ ...s }));

export function getRents() {
  return rents;
}
export function getMaintenance() {
  return maintenance;
}
export function getSms() {
  return sms;
}

export function payRent(rentId: string) {
  const r = rents.find((x) => x.id === rentId);
  if (!r) return;
  const now = new Date();
  r.status = "paid";
  r.paidDate = now.toISOString();
  r.transactionId = "PYT" + now.toISOString().replace(/\D/g, "").slice(0, 14);

  sms = [
    {
      id: "sms-" + now.getTime(),
      to: "+254 7XX XXX XXX",
      recipient: r.tenantName,
      type: "received",
      body: `✅ PAYMENT RECEIVED\nAmount: KES ${r.amount.toLocaleString()}\nDate: ${now.toLocaleDateString("en-KE", { month: "short", day: "numeric" })}\nTransaction: ${r.transactionId}\nThank you for prompt payment!`,
      sentAt: now.toISOString(),
    },
    ...sms,
  ];
  emit();
  return r;
}

export function addMaintenance(req: Omit<MaintenanceRequest, "id" | "submittedAt" | "updatedAt" | "status">) {
  const now = new Date().toISOString();
  const newReq: MaintenanceRequest = {
    ...req,
    id: "m-" + Date.now(),
    status: "submitted",
    submittedAt: now,
    updatedAt: now,
  };
  maintenance = [newReq, ...maintenance];
  emit();
  return newReq;
}

export function updateMaintenanceStatus(id: string, status: MaintenanceRequest["status"]) {
  const m = maintenance.find((x) => x.id === id);
  if (!m) return;
  m.status = status;
  m.updatedAt = new Date().toISOString();
  emit();
}

export function useStore<T>(selector: () => T): T {
  const [val, setVal] = useState<T>(() => selector());
  useEffect(() => {
    const unsub = subscribe(() => setVal(selector()));
    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return val;
}
