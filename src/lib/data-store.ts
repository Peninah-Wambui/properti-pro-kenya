import { useEffect, useState } from "react";
import {
  RENT_RECORDS,
  MAINTENANCE,
  SMS_LOG,
  LEASES,
  EXPENSES,
  VENDORS,
  type RentRecord,
  type MaintenanceRequest,
  type SmsMessage,
  type Lease,
  type Expense,
  type Vendor,
} from "./mock-data";
import { subscribe, emit } from "./auth-store";

// In-memory clones so the demo can mutate
let rents: RentRecord[] = RENT_RECORDS.map((r) => ({ ...r }));
let maintenance: MaintenanceRequest[] = MAINTENANCE.map((m) => ({ ...m }));
let sms: SmsMessage[] = SMS_LOG.map((s) => ({ ...s }));
let leases: Lease[] = LEASES.map((l) => ({ ...l, documents: [...l.documents] }));
let expenses: Expense[] = EXPENSES.map((e) => ({ ...e }));

export function getRents() { return rents; }
export function getMaintenance() { return maintenance; }
export function getSms() { return sms; }
export function getLeases() { return leases; }
export function getExpenses() { return expenses; }
export function getVendors(): Vendor[] { return VENDORS; }

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

export function assignMaintenanceVendor(id: string, vendor: string) {
  const m = maintenance.find((x) => x.id === id);
  if (!m) return;
  m.assignedTo = vendor;
  if (m.status === "submitted") m.status = "in_progress";
  m.updatedAt = new Date().toISOString();
  emit();
}

export function addExpense(expense: Omit<Expense, "id">) {
  const newExp: Expense = { ...expense, id: "e-" + Date.now() };
  expenses = [newExp, ...expenses];
  emit();
  return newExp;
}

export function useStore<T>(selector: () => T): T {
  const [val, setVal] = useState<T>(() => selector());
  useEffect(() => {
    const unsub = subscribe(() => setVal(selector()));
    return () => { unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return val;
}
