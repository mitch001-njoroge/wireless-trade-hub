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
  // Edgeview Apartment - Block A (21,000 KES)
  {
    id: "edgeview-a1",
    name: "Sharon Ayodo",
    email: "sharon.ayodo@email.com",
    phone: "+254 729 078 390",
    apartmentId: "edgeview",
    unitNumber: "A1",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a2",
    name: "Senik Kindudi",
    email: "senik.kindudi@email.com",
    phone: "+254 794 670 666",
    apartmentId: "edgeview",
    unitNumber: "A2",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a3",
    name: "Rodgers Simiyu",
    email: "rodgers.simiyu@email.com",
    phone: "+254 718 488 871",
    apartmentId: "edgeview",
    unitNumber: "A3",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a4",
    name: "Ruth Nuru",
    email: "ruth.nuru@email.com",
    phone: "+254 704 878 170",
    apartmentId: "edgeview",
    unitNumber: "A4",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a5",
    name: "Sadra Xiomara",
    email: "sadra.xiomara@email.com",
    phone: "+254 742 592 922",
    apartmentId: "edgeview",
    unitNumber: "A5",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a6",
    name: "Linus Kipkoech",
    email: "linus.kipkoech@email.com",
    phone: "+254 714 348 045",
    apartmentId: "edgeview",
    unitNumber: "A6",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a7",
    name: "Joshua Muuo Mutuku",
    email: "joshua.mutuku@email.com",
    phone: "+254 702 993 077",
    apartmentId: "edgeview",
    unitNumber: "A7",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a8",
    name: "Caroline Nyambura",
    email: "caroline.nyambura@email.com",
    phone: "+254 720 051 084",
    apartmentId: "edgeview",
    unitNumber: "A8",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a9",
    name: "Grace Neema",
    email: "grace.neema@email.com",
    phone: "+254 745 042 027",
    apartmentId: "edgeview",
    unitNumber: "A9",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a10",
    name: "Esther Nanjala",
    email: "esther.nanjala@email.com",
    phone: "+254 797 822 371",
    apartmentId: "edgeview",
    unitNumber: "A10",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-a11",
    name: "David Ng'ang'a",
    email: "david.nganga@email.com",
    phone: "+254 728 554 276",
    apartmentId: "edgeview",
    unitNumber: "A11",
    rentAmount: 21000,
    amountPaid: 0,
    balance: 21000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  // Edgeview Apartment - Block B (23,000 KES)
  {
    id: "edgeview-b2",
    name: "John Mulwa",
    email: "john.mulwa@email.com",
    phone: "+254 722 787 686",
    apartmentId: "edgeview",
    unitNumber: "B2",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-b3",
    name: "Mercy Gwambenza",
    email: "mercy.gwambenza@email.com",
    phone: "+254 718 554 633",
    apartmentId: "edgeview",
    unitNumber: "B3",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-b4",
    name: "Regina Kavete",
    email: "regina.kavete@email.com",
    phone: "+254 700 254 873",
    apartmentId: "edgeview",
    unitNumber: "B4",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-b5",
    name: "Brian Mayega Ondieki",
    email: "brian.ondieki@email.com",
    phone: "+254 711 106 719",
    apartmentId: "edgeview",
    unitNumber: "B5",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  // Edgeview Apartment - Block C (23,000 KES)
  {
    id: "edgeview-c1",
    name: "Brian Tinega",
    email: "brian.tinega@email.com",
    phone: "+254 115 193 509",
    apartmentId: "edgeview",
    unitNumber: "C1",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c2",
    name: "Tommy Kenny",
    email: "tommy.kenny@email.com",
    phone: "+254 718 854 546",
    apartmentId: "edgeview",
    unitNumber: "C2",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c3",
    name: "Betty Ndumba",
    email: "betty.ndumba@email.com",
    phone: "+254 717 788 298",
    apartmentId: "edgeview",
    unitNumber: "C3",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c4",
    name: "Ann Njoki",
    email: "ann.njoki@email.com",
    phone: "+254 700 491 468",
    apartmentId: "edgeview",
    unitNumber: "C4",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c5",
    name: "Stanley Ombui",
    email: "stanley.ombui@email.com",
    phone: "+254 700 635 740",
    apartmentId: "edgeview",
    unitNumber: "C5",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c6",
    name: "Festus Oyamo",
    email: "festus.oyamo@email.com",
    phone: "+254 729 177 346",
    apartmentId: "edgeview",
    unitNumber: "C6",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c7",
    name: "Evans Kirwa",
    email: "evans.kirwa@email.com",
    phone: "+254 799 262 827",
    apartmentId: "edgeview",
    unitNumber: "C7",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c8",
    name: "Raphael Ndwiga",
    email: "raphael.ndwiga@email.com",
    phone: "+254 712 550 547",
    apartmentId: "edgeview",
    unitNumber: "C8",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c9",
    name: "Sheila Chepkemei",
    email: "sheila.chepkemei@email.com",
    phone: "+254 795 545 559",
    apartmentId: "edgeview",
    unitNumber: "C9",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
  },
  {
    id: "edgeview-c10",
    name: "Mark Arnold",
    email: "mark.arnold@email.com",
    phone: "+254 717 563 497",
    apartmentId: "edgeview",
    unitNumber: "C10",
    rentAmount: 23000,
    amountPaid: 0,
    balance: 23000,
    paymentStatus: "unpaid",
    lastPaymentDate: null,
    moveInDate: "2026-01-08",
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
