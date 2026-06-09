// Mock data for the property management demo

export type UserRole = "landlord" | "tenant";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  unitId?: string; // for tenants
  subscription?: "Premium" | "Basic"; // for landlords
}

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  type: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyIncome: number;
  image: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  rent: number;
  tenantId?: string;
}

export type PaymentStatus = "paid" | "pending" | "overdue";

export interface RentRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitLabel: string;
  propertyName: string;
  amount: number;
  dueDate: string; // ISO
  paidDate?: string;
  status: PaymentStatus;
  transactionId?: string;
}

export type MaintenanceStatus = "submitted" | "in_progress" | "completed";

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  unitLabel: string;
  propertyName: string;
  issue: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: MaintenanceStatus;
  submittedAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface Lease {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  unitLabel: string;
  propertyName: string;
  rent: number;
  deposit: number;
  startDate: string; // ISO
  endDate: string; // ISO
  status: "active" | "ending_soon" | "expired";
  documents: { name: string; size: string }[];
  notes?: string;
}

export type ExpenseCategory =
  | "Repairs"
  | "Utilities"
  | "Cleaning"
  | "Security"
  | "Taxes"
  | "Insurance"
  | "Other";

export interface Expense {
  id: string;
  date: string; // ISO
  propertyName: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  trade: string;
  phone: string;
  rating: number; // 1-5
}

export interface SmsMessage {
  id: string;
  to: string;
  recipient: string;
  type: "reminder" | "received" | "overdue" | "report";
  body: string;
  sentAt: string;
}

export const USERS: User[] = [
  {
    id: "u-john",
    name: "John Mwangi",
    email: "john@properties.com",
    password: "Demo@123",
    role: "landlord",
    phone: "+254 712 345 678",
    subscription: "Premium",
  },
  {
    id: "u-sarah",
    name: "Sarah Kipchoge",
    email: "sarah@rental.com",
    password: "Demo@123",
    role: "landlord",
    phone: "+254 722 111 222",
    subscription: "Basic",
  },
  {
    id: "u-david",
    name: "David Kariuki",
    email: "david@email.com",
    password: "Demo@123",
    role: "tenant",
    phone: "+254 711 223 344",
    unitId: "unit-5",
  },
  {
    id: "u-grace",
    name: "Grace Wanjiru",
    email: "grace@email.com",
    password: "Demo@123",
    role: "tenant",
    phone: "+254 733 556 778",
    unitId: "unit-12",
  },
  {
    id: "u-peter",
    name: "Peter Omondi",
    email: "peter@email.com",
    password: "Demo@123",
    role: "tenant",
    phone: "+254 700 998 877",
    unitId: "unit-8",
  },
];

export const PROPERTIES: Property[] = [
  {
    id: "prop-1",
    ownerId: "u-john",
    name: "Riverside Apartments",
    location: "Westlands, Nairobi",
    type: "Multi-unit apartment",
    totalUnits: 8,
    occupiedUnits: 7,
    monthlyIncome: 105000,
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  },
  {
    id: "prop-2",
    ownerId: "u-john",
    name: "Green Hill Villas",
    location: "Karen, Nairobi",
    type: "Individual houses",
    totalUnits: 5,
    occupiedUnits: 5,
    monthlyIncome: 125000,
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
  },
  {
    id: "prop-3",
    ownerId: "u-john",
    name: "Downtown Studios",
    location: "CBD, Nairobi",
    type: "Studio apartments",
    totalUnits: 12,
    occupiedUnits: 10,
    monthlyIncome: 72000,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
];

const TENANT_NAMES = [
  "David Kariuki", "Grace Wanjiru", "Peter Omondi", "Amara Hassan",
  "James Kiplagat", "Alice Muumbi", "Mercy Achieng", "Brian Otieno",
  "Lucy Njeri", "Samuel Mutua", "Faith Chebet", "Daniel Korir",
];

// Build 24 rent records spanning Oct/Nov/Dec 2024
function buildRents(): RentRecord[] {
  const records: RentRecord[] = [];
  const today = new Date("2024-12-12");

  const tenants = [
    { id: "u-david", name: "David Kariuki", unit: "Unit 5", prop: "Riverside Apartments", amount: 15000 },
    { id: "u-grace", name: "Grace Wanjiru", unit: "Unit 12", prop: "Downtown Studios", amount: 20000 },
    { id: "u-peter", name: "Peter Omondi", unit: "Unit 8", prop: "Riverside Apartments", amount: 18000 },
    { id: "t-4", name: "Amara Hassan", unit: "Unit 3", prop: "Riverside Apartments", amount: 18000 },
    { id: "t-5", name: "James Kiplagat", unit: "Unit 7", prop: "Riverside Apartments", amount: 15000 },
    { id: "t-6", name: "Alice Muumbi", unit: "Unit 15", prop: "Green Hill Villas", amount: 25000 },
    { id: "t-7", name: "Mercy Achieng", unit: "Unit 2", prop: "Downtown Studios", amount: 12000 },
    { id: "t-8", name: "Brian Otieno", unit: "Unit 4", prop: "Downtown Studios", amount: 14000 },
  ];

  let idCounter = 1;
  const months = [
    { name: "October", num: 10, year: 2024 },
    { name: "November", num: 11, year: 2024 },
    { name: "December", num: 12, year: 2024 },
  ];

  tenants.forEach((t, tIdx) => {
    months.forEach((m) => {
      const due = new Date(m.year, m.num - 1, 10);
      const dueIso = due.toISOString();
      let status: PaymentStatus = "pending";
      let paidDate: string | undefined;
      let txId: string | undefined;

      if (m.num === 10) {
        // October: all paid
        status = "paid";
        paidDate = new Date(m.year, m.num - 1, 12 + (tIdx % 4)).toISOString();
        txId = `PYT2024100${idCounter}`;
      } else if (m.num === 11) {
        // November: mostly paid, a couple overdue
        if (tIdx % 4 === 2) {
          status = "overdue";
        } else {
          status = "paid";
          paidDate = new Date(m.year, m.num - 1, 11 + (tIdx % 6)).toISOString();
          txId = `PYT2024110${idCounter}`;
        }
      } else if (m.num === 12) {
        // December: mix
        if (tIdx % 3 === 0) {
          status = "paid";
          paidDate = new Date(m.year, m.num - 1, 10 + (tIdx % 3)).toISOString();
          txId = `PYT2024120${idCounter}`;
        } else if (tIdx % 5 === 4) {
          // overdue case (Dec 5 due, today Dec 12)
          status = "overdue";
        } else {
          status = "pending";
        }
      }

      records.push({
        id: `rent-${idCounter++}`,
        tenantId: t.id,
        tenantName: t.name,
        unitId: t.unit.toLowerCase().replace(" ", "-"),
        unitLabel: t.unit,
        propertyName: t.prop,
        amount: t.amount,
        dueDate: dueIso,
        paidDate,
        status,
        transactionId: txId,
      });
    });
  });

  return records;
}

export const RENT_RECORDS: RentRecord[] = buildRents();

export const MAINTENANCE: MaintenanceRequest[] = [
  {
    id: "m-1",
    tenantId: "u-david",
    tenantName: "David Kariuki",
    unitLabel: "Unit 5",
    propertyName: "Riverside Apartments",
    issue: "Leaking tap in kitchen",
    description: "Kitchen sink tap drips constantly, water pooling under sink.",
    priority: "medium",
    status: "completed",
    submittedAt: "2024-12-08T09:30:00Z",
    updatedAt: "2024-12-09T14:15:00Z",
    assignedTo: "Plumbing Team",
  },
  {
    id: "m-2",
    tenantId: "u-grace",
    tenantName: "Grace Wanjiru",
    unitLabel: "Unit 12",
    propertyName: "Downtown Studios",
    issue: "Air conditioning not working",
    description: "AC blowing warm air despite being set to cool. Started yesterday.",
    priority: "high",
    status: "in_progress",
    submittedAt: "2024-12-11T16:00:00Z",
    updatedAt: "2024-12-12T08:00:00Z",
    assignedTo: "HVAC Repair Team",
  },
  {
    id: "m-3",
    tenantId: "u-peter",
    tenantName: "Peter Omondi",
    unitLabel: "Unit 8",
    propertyName: "Riverside Apartments",
    issue: "Door lock jammed",
    description: "Main door lock won't turn properly, struggling to enter unit.",
    priority: "high",
    status: "submitted",
    submittedAt: "2024-12-12T10:00:00Z",
    updatedAt: "2024-12-12T10:00:00Z",
  },
  {
    id: "m-4",
    tenantId: "t-5",
    tenantName: "James Kiplagat",
    unitLabel: "Unit 7",
    propertyName: "Riverside Apartments",
    issue: "Broken window latch",
    description: "Bedroom window won't close fully.",
    priority: "low",
    status: "in_progress",
    submittedAt: "2024-12-10T11:20:00Z",
    updatedAt: "2024-12-11T09:00:00Z",
    assignedTo: "Maintenance Crew",
  },
];

export const SMS_LOG: SmsMessage[] = [
  {
    id: "sms-1",
    to: "+254 733 556 778",
    recipient: "Grace Wanjiru",
    type: "reminder",
    body: "💰 RENT REMINDER\nGrace, your rent of KES 20,000 is due Dec 10.\nPayment link: pay.rentik/g12",
    sentAt: "2024-12-07T08:00:00Z",
  },
  {
    id: "sms-2",
    to: "+254 711 223 344",
    recipient: "David Kariuki",
    type: "received",
    body: "✅ PAYMENT RECEIVED\nAmount: KES 15,000\nDate: Dec 12\nTransaction: PYT20241212001\nThank you!",
    sentAt: "2024-12-12T10:15:00Z",
  },
  {
    id: "sms-3",
    to: "+254 700 998 877",
    recipient: "Peter Omondi",
    type: "overdue",
    body: "⚠️ PAYMENT OVERDUE\nYour rent of KES 18,000 was due Nov 10.\nDays overdue: 32\nPlease pay immediately.\nContact: +254 712 345 678",
    sentAt: "2024-12-12T07:30:00Z",
  },
  {
    id: "sms-4",
    to: "+254 712 345 678",
    recipient: "John Mwangi",
    type: "report",
    body: "📊 DAILY REPORT\nProperties: 3\nUnits: 25\nRents Due: KES 302,000\nCollected Today: KES 38,000\nOverdue: KES 27,000\nNew Issues: 1",
    sentAt: "2024-12-12T07:00:00Z",
  },
  {
    id: "sms-5",
    to: "+254 733 556 778",
    recipient: "Grace Wanjiru",
    type: "reminder",
    body: "💰 RENT REMINDER\nYour rent of KES 20,000 is due in 3 days (Dec 10).",
    sentAt: "2024-12-07T08:00:00Z",
  },
  {
    id: "sms-6",
    to: "+254 711 223 344",
    recipient: "David Kariuki",
    type: "received",
    body: "✅ PAYMENT RECEIVED\nAmount: KES 15,000\nDate: Nov 14\nTransaction: PYT20241114007\nThank you!",
    sentAt: "2024-11-14T11:00:00Z",
  },
  {
    id: "sms-7",
    to: "+254 722 111 222",
    recipient: "Sarah Kipchoge",
    type: "report",
    body: "📊 DAILY REPORT\nProperties: 2\nUnits: 9\nCollected Today: KES 22,000\nOverdue: KES 12,000",
    sentAt: "2024-12-11T07:00:00Z",
  },
  {
    id: "sms-8",
    to: "+254 700 998 877",
    recipient: "Peter Omondi",
    type: "reminder",
    body: "💰 RENT REMINDER\nYour rent of KES 18,000 is due Dec 10.",
    sentAt: "2024-12-07T08:00:00Z",
  },
  {
    id: "sms-9",
    to: "+254 712 345 678",
    recipient: "John Mwangi",
    type: "report",
    body: "📊 WEEKLY SUMMARY\nCollection rate: 89.4%\nNew payments: 5\nOverdue accounts: 3",
    sentAt: "2024-12-08T09:00:00Z",
  },
  {
    id: "sms-10",
    to: "+254 733 556 778",
    recipient: "Grace Wanjiru",
    type: "received",
    body: "✅ PAYMENT RECEIVED\nAmount: KES 20,000\nDate: Oct 15\nTransaction: PYT20241015003\nThank you!",
    sentAt: "2024-10-15T13:30:00Z",
  },
  {
    id: "sms-11",
    to: "+254 711 223 344",
    recipient: "David Kariuki",
    type: "reminder",
    body: "💰 Your rent of KES 15,000 is due Dec 10.",
    sentAt: "2024-12-07T08:00:00Z",
  },
  {
    id: "sms-12",
    to: "+254 712 345 678",
    recipient: "John Mwangi",
    type: "report",
    body: "📊 DAILY REPORT\nCollected Today: KES 33,000\nOverdue: KES 27,000\nOccupancy: 88%",
    sentAt: "2024-12-10T07:00:00Z",
  },
];

export function formatKES(amount: number): string {
  return "KES " + amount.toLocaleString("en-KE");
}

export function daysUntil(iso: string, from = new Date("2024-12-12")): number {
  const due = new Date(iso);
  return Math.ceil((due.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
