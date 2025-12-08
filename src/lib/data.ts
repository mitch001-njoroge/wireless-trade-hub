export type PaymentStatus = "paid" | "partial" | "unpaid";

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  apartmentId: string;
  unitNumber: string;
  rentAmount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  lastPaymentDate: string | null;
  moveInDate: string;
}

export interface Apartment {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  collectedRevenue: number;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  apartmentName: string;
  amount: number;
  date: string;
  method: string;
  receiptUrl?: string;
}

export const apartments: Apartment[] = [
  {
    id: "amberview",
    name: "Amberview Apartment",
    address: "Lumumba, Roysambu, Nairobi",
    totalUnits: 12,
    occupiedUnits: 10,
    monthlyRevenue: 2500000,
    collectedRevenue: 2100000,
  },
  {
    id: "grandview",
    name: "Grandview Apartment",
    address: "Mirema Drive, Roysambu, Nairobi",
    totalUnits: 16,
    occupiedUnits: 14,
    monthlyRevenue: 3500000,
    collectedRevenue: 3200000,
  },
  {
    id: "elite",
    name: "Elite Apartment",
    address: "Mirema Drive, Roysambu, Nairobi",
    totalUnits: 8,
    occupiedUnits: 8,
    monthlyRevenue: 2000000,
    collectedRevenue: 1800000,
  },
  {
    id: "edgeview",
    name: "Edgeview Apartment",
    address: "Mirema Drive, Roysambu, Nairobi",
    totalUnits: 10,
    occupiedUnits: 9,
    monthlyRevenue: 2250000,
    collectedRevenue: 1950000,
  },
];

export const initialTenants: Tenant[] = [
  {
    id: "1",
    name: "James Mwangi",
    email: "james.mwangi@email.com",
    phone: "+254 712 345 678",
    apartmentId: "amberview",
    unitNumber: "A101",
    rentAmount: 250000,
    amountPaid: 250000,
    balance: 0,
    paymentStatus: "paid",
    lastPaymentDate: "2024-12-01",
    moveInDate: "2023-06-15",
  },
  {
    id: "2",
    name: "Wanjiku Kamau",
    email: "wanjiku.kamau@email.com",
    phone: "+254 722 456 789",
    apartmentId: "amberview",
    unitNumber: "A102",
    rentAmount: 250000,
    amountPaid: 150000,
    balance: 100000,
    paymentStatus: "partial",
    lastPaymentDate: "2024-11-28",
    moveInDate: "2023-08-01",
  },
  {
    id: "3",
    name: "Kevin Otieno",
    email: "kevin.otieno@email.com",
    phone: "+254 733 567 890",
    apartmentId: "grandview",
    unitNumber: "G201",
    rentAmount: 220000,
    amountPaid: 0,
    balance: 220000,
    paymentStatus: "unpaid",
    lastPaymentDate: "2024-10-05",
    moveInDate: "2024-01-10",
  },
  {
    id: "4",
    name: "Akinyi Odhiambo",
    email: "akinyi.odhiambo@email.com",
    phone: "+254 744 678 901",
    apartmentId: "grandview",
    unitNumber: "G202",
    rentAmount: 220000,
    amountPaid: 220000,
    balance: 0,
    paymentStatus: "paid",
    lastPaymentDate: "2024-12-03",
    moveInDate: "2023-03-20",
  },
  {
    id: "5",
    name: "Peter Njoroge",
    email: "peter.njoroge@email.com",
    phone: "+254 755 789 012",
    apartmentId: "elite",
    unitNumber: "E301",
    rentAmount: 250000,
    amountPaid: 250000,
    balance: 0,
    paymentStatus: "paid",
    lastPaymentDate: "2024-12-02",
    moveInDate: "2023-09-01",
  },
  {
    id: "6",
    name: "Faith Wambui",
    email: "faith.wambui@email.com",
    phone: "+254 766 890 123",
    apartmentId: "elite",
    unitNumber: "E302",
    rentAmount: 250000,
    amountPaid: 100000,
    balance: 150000,
    paymentStatus: "partial",
    lastPaymentDate: "2024-11-25",
    moveInDate: "2024-02-15",
  },
  {
    id: "7",
    name: "Daniel Kipchoge",
    email: "daniel.kipchoge@email.com",
    phone: "+254 777 901 234",
    apartmentId: "edgeview",
    unitNumber: "D401",
    rentAmount: 225000,
    amountPaid: 225000,
    balance: 0,
    paymentStatus: "paid",
    lastPaymentDate: "2024-12-01",
    moveInDate: "2023-04-10",
  },
  {
    id: "8",
    name: "Mary Nyambura",
    email: "mary.nyambura@email.com",
    phone: "+254 788 012 345",
    apartmentId: "edgeview",
    unitNumber: "D402",
    rentAmount: 225000,
    amountPaid: 0,
    balance: 225000,
    paymentStatus: "unpaid",
    lastPaymentDate: "2024-09-15",
    moveInDate: "2023-11-01",
  },
];

// Load tenants from localStorage or use initial data
export const loadTenants = (): Tenant[] => {
  const stored = localStorage.getItem("tenants");
  if (stored) {
    return JSON.parse(stored);
  }
  return initialTenants;
};

// Save tenants to localStorage
export const saveTenants = (tenantList: Tenant[]): void => {
  localStorage.setItem("tenants", JSON.stringify(tenantList));
};

// For backward compatibility
export const tenants = loadTenants();

export const recentPayments: Payment[] = [
  {
    id: "p1",
    tenantId: "1",
    tenantName: "James Mwangi",
    apartmentName: "Amberview Apartment",
    amount: 250000,
    date: "2024-12-01",
    method: "Bank Transfer",
  },
  {
    id: "p2",
    tenantId: "4",
    tenantName: "Akinyi Odhiambo",
    apartmentName: "Grandview Apartment",
    amount: 220000,
    date: "2024-12-03",
    method: "Bank Transfer",
  },
  {
    id: "p3",
    tenantId: "5",
    tenantName: "Peter Njoroge",
    apartmentName: "Elite Apartment",
    amount: 250000,
    date: "2024-12-02",
    method: "Cash",
  },
  {
    id: "p4",
    tenantId: "7",
    tenantName: "Daniel Kipchoge",
    apartmentName: "Edgeview Apartment",
    amount: 225000,
    date: "2024-12-01",
    method: "Bank Transfer",
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "paid":
      return "status-paid";
    case "partial":
      return "status-partial";
    case "unpaid":
      return "status-unpaid";
    default:
      return "";
  }
};

export const getApartmentById = (id: string): Apartment | undefined => {
  return apartments.find((apt) => apt.id === id);
};

export const getTenantsByApartment = (apartmentId: string): Tenant[] => {
  const currentTenants = loadTenants();
  return currentTenants.filter((tenant) => tenant.apartmentId === apartmentId);
};
