export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

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
    id: 'amberview',
    name: 'Amberview Apartment',
    address: '123 Amber Street, Lagos',
    totalUnits: 12,
    occupiedUnits: 10,
    monthlyRevenue: 2500000,
    collectedRevenue: 2100000,
  },
  {
    id: 'grandview',
    name: 'Grandview Apartment',
    address: '456 Grand Avenue, Lagos',
    totalUnits: 16,
    occupiedUnits: 14,
    monthlyRevenue: 3500000,
    collectedRevenue: 3200000,
  },
  {
    id: 'elite',
    name: 'Elite Apartment',
    address: '789 Elite Boulevard, Lagos',
    totalUnits: 8,
    occupiedUnits: 8,
    monthlyRevenue: 2000000,
    collectedRevenue: 1800000,
  },
  {
    id: 'edgeview',
    name: 'Edgeview Apartment',
    address: '321 Edge Road, Lagos',
    totalUnits: 10,
    occupiedUnits: 9,
    monthlyRevenue: 2250000,
    collectedRevenue: 1950000,
  },
];

export const tenants: Tenant[] = [
  {
    id: '1',
    name: 'John Adeyemi',
    email: 'john.adeyemi@email.com',
    phone: '+234 801 234 5678',
    apartmentId: 'amberview',
    unitNumber: 'A101',
    rentAmount: 250000,
    amountPaid: 250000,
    balance: 0,
    paymentStatus: 'paid',
    lastPaymentDate: '2024-12-01',
    moveInDate: '2023-06-15',
  },
  {
    id: '2',
    name: 'Sarah Okonkwo',
    email: 'sarah.okonkwo@email.com',
    phone: '+234 802 345 6789',
    apartmentId: 'amberview',
    unitNumber: 'A102',
    rentAmount: 250000,
    amountPaid: 150000,
    balance: 100000,
    paymentStatus: 'partial',
    lastPaymentDate: '2024-11-28',
    moveInDate: '2023-08-01',
  },
  {
    id: '3',
    name: 'Michael Eze',
    email: 'michael.eze@email.com',
    phone: '+234 803 456 7890',
    apartmentId: 'grandview',
    unitNumber: 'G201',
    rentAmount: 220000,
    amountPaid: 0,
    balance: 220000,
    paymentStatus: 'unpaid',
    lastPaymentDate: '2024-10-05',
    moveInDate: '2024-01-10',
  },
  {
    id: '4',
    name: 'Grace Nnamdi',
    email: 'grace.nnamdi@email.com',
    phone: '+234 804 567 8901',
    apartmentId: 'grandview',
    unitNumber: 'G202',
    rentAmount: 220000,
    amountPaid: 220000,
    balance: 0,
    paymentStatus: 'paid',
    lastPaymentDate: '2024-12-03',
    moveInDate: '2023-03-20',
  },
  {
    id: '5',
    name: 'David Balogun',
    email: 'david.balogun@email.com',
    phone: '+234 805 678 9012',
    apartmentId: 'elite',
    unitNumber: 'E301',
    rentAmount: 250000,
    amountPaid: 250000,
    balance: 0,
    paymentStatus: 'paid',
    lastPaymentDate: '2024-12-02',
    moveInDate: '2023-09-01',
  },
  {
    id: '6',
    name: 'Amina Ibrahim',
    email: 'amina.ibrahim@email.com',
    phone: '+234 806 789 0123',
    apartmentId: 'elite',
    unitNumber: 'E302',
    rentAmount: 250000,
    amountPaid: 100000,
    balance: 150000,
    paymentStatus: 'partial',
    lastPaymentDate: '2024-11-25',
    moveInDate: '2024-02-15',
  },
  {
    id: '7',
    name: 'Peter Okafor',
    email: 'peter.okafor@email.com',
    phone: '+234 807 890 1234',
    apartmentId: 'edgeview',
    unitNumber: 'D401',
    rentAmount: 225000,
    amountPaid: 225000,
    balance: 0,
    paymentStatus: 'paid',
    lastPaymentDate: '2024-12-01',
    moveInDate: '2023-04-10',
  },
  {
    id: '8',
    name: 'Chioma Ugwu',
    email: 'chioma.ugwu@email.com',
    phone: '+234 808 901 2345',
    apartmentId: 'edgeview',
    unitNumber: 'D402',
    rentAmount: 225000,
    amountPaid: 0,
    balance: 225000,
    paymentStatus: 'unpaid',
    lastPaymentDate: '2024-09-15',
    moveInDate: '2023-11-01',
  },
];

export const recentPayments: Payment[] = [
  {
    id: 'p1',
    tenantId: '1',
    tenantName: 'John Adeyemi',
    apartmentName: 'Amberview Apartment',
    amount: 250000,
    date: '2024-12-01',
    method: 'Bank Transfer',
  },
  {
    id: 'p2',
    tenantId: '4',
    tenantName: 'Grace Nnamdi',
    apartmentName: 'Grandview Apartment',
    amount: 220000,
    date: '2024-12-03',
    method: 'Bank Transfer',
  },
  {
    id: 'p3',
    tenantId: '5',
    tenantName: 'David Balogun',
    apartmentName: 'Elite Apartment',
    amount: 250000,
    date: '2024-12-02',
    method: 'Cash',
  },
  {
    id: 'p4',
    tenantId: '7',
    tenantName: 'Peter Okafor',
    apartmentName: 'Edgeview Apartment',
    amount: 225000,
    date: '2024-12-01',
    method: 'Bank Transfer',
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'paid':
      return 'status-paid';
    case 'partial':
      return 'status-partial';
    case 'unpaid':
      return 'status-unpaid';
    default:
      return '';
  }
};

export const getApartmentById = (id: string): Apartment | undefined => {
  return apartments.find((apt) => apt.id === id);
};

export const getTenantsByApartment = (apartmentId: string): Tenant[] => {
  return tenants.filter((tenant) => tenant.apartmentId === apartmentId);
};
