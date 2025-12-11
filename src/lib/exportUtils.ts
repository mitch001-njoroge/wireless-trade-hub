import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { apartments, loadTenants, formatCurrency, getTenantsByApartment } from './data';

interface ApartmentStats {
  name: string;
  expected: number;
  collected: number;
  outstanding: number;
  paid: number;
  partial: number;
  unpaid: number;
  rate: string;
}

const getApartmentStats = (apartmentId: string): ApartmentStats => {
  const apt = apartments.find((a) => a.id === apartmentId);
  const aptTenants = getTenantsByApartment(apartmentId);
  const paid = aptTenants.filter((t) => t.paymentStatus === 'paid').length;
  const partial = aptTenants.filter((t) => t.paymentStatus === 'partial').length;
  const unpaid = aptTenants.filter((t) => t.paymentStatus === 'unpaid').length;
  const expected = apt?.monthlyRevenue || 0;
  const collected = apt?.collectedRevenue || 0;

  return {
    name: apt?.name || '',
    expected,
    collected,
    outstanding: expected - collected,
    paid,
    partial,
    unpaid,
    rate: ((collected / expected) * 100).toFixed(0) + '%',
  };
};

const formatCurrencyPlain = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const exportToPDF = (selectedMonth: string) => {
  const doc = new jsPDF();
  const tenants = loadTenants();
  const overdueTenants = tenants.filter((t) => t.paymentStatus === 'unpaid' || t.paymentStatus === 'partial');
  
  const monthName = selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1);
  const totalExpected = apartments.reduce((sum, apt) => sum + apt.monthlyRevenue, 0);
  const totalCollected = apartments.reduce((sum, apt) => sum + apt.collectedRevenue, 0);
  const outstanding = totalExpected - totalCollected;

  // Title
  doc.setFontSize(20);
  doc.text('Rental Management Report', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Month: ${monthName} 2024`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);

  // Summary
  doc.setFontSize(14);
  doc.text('Financial Summary', 14, 50);
  
  doc.setFontSize(10);
  doc.text(`Total Expected: ${formatCurrencyPlain(totalExpected)}`, 14, 60);
  doc.text(`Total Collected: ${formatCurrencyPlain(totalCollected)}`, 14, 67);
  doc.text(`Outstanding: ${formatCurrencyPlain(outstanding)}`, 14, 74);

  // Apartment Report Table
  doc.setFontSize(14);
  doc.text('Monthly Rent Report by Apartment', 14, 90);

  const apartmentData = apartments.map((apt) => {
    const stats = getApartmentStats(apt.id);
    return [
      stats.name,
      formatCurrencyPlain(stats.expected),
      formatCurrencyPlain(stats.collected),
      formatCurrencyPlain(stats.outstanding),
      stats.paid.toString(),
      stats.partial.toString(),
      stats.unpaid.toString(),
      stats.rate,
    ];
  });

  autoTable(doc, {
    startY: 95,
    head: [['Apartment', 'Expected', 'Collected', 'Outstanding', 'Paid', 'Partial', 'Unpaid', 'Rate']],
    body: apartmentData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
  });

  // Overdue Tenants Table
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(14);
  doc.text('Overdue Tenants Summary', 14, finalY + 15);

  if (overdueTenants.length > 0) {
    const overdueData = overdueTenants.map((tenant) => {
      const apt = apartments.find((a) => a.id === tenant.apartmentId);
      return [
        tenant.name,
        apt?.name || '',
        tenant.unitNumber,
        formatCurrencyPlain(tenant.balance),
        tenant.lastPaymentDate || '-',
      ];
    });

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Tenant', 'Apartment', 'Unit', 'Balance', 'Last Payment']],
      body: overdueData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 8 },
    });
  } else {
    doc.setFontSize(10);
    doc.text('No overdue tenants', 14, finalY + 25);
  }

  doc.save(`rental-report-${monthName.toLowerCase()}-2024.pdf`);
};

export const exportToExcel = (selectedMonth: string) => {
  const tenants = loadTenants();
  const overdueTenants = tenants.filter((t) => t.paymentStatus === 'unpaid' || t.paymentStatus === 'partial');
  const monthName = selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1);

  // Summary sheet data
  const totalExpected = apartments.reduce((sum, apt) => sum + apt.monthlyRevenue, 0);
  const totalCollected = apartments.reduce((sum, apt) => sum + apt.collectedRevenue, 0);
  const outstanding = totalExpected - totalCollected;

  const summaryData = [
    ['Rental Management Report'],
    [`Month: ${monthName} 2024`],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    ['Financial Summary'],
    ['Total Expected', totalExpected],
    ['Total Collected', totalCollected],
    ['Outstanding', outstanding],
  ];

  // Apartment report data
  const apartmentHeaders = ['Apartment', 'Expected', 'Collected', 'Outstanding', 'Paid', 'Partial', 'Unpaid', 'Rate'];
  const apartmentData = apartments.map((apt) => {
    const stats = getApartmentStats(apt.id);
    return [
      stats.name,
      stats.expected,
      stats.collected,
      stats.outstanding,
      stats.paid,
      stats.partial,
      stats.unpaid,
      stats.rate,
    ];
  });

  // Overdue tenants data
  const overdueHeaders = ['Tenant', 'Apartment', 'Unit', 'Balance', 'Last Payment'];
  const overdueData = overdueTenants.map((tenant) => {
    const apt = apartments.find((a) => a.id === tenant.apartmentId);
    return [
      tenant.name,
      apt?.name || '',
      tenant.unitNumber,
      tenant.balance,
      tenant.lastPaymentDate || '-',
    ];
  });

  // All tenants data
  const allTenantsHeaders = ['Name', 'Email', 'Phone', 'Apartment', 'Unit', 'Rent Amount', 'Amount Paid', 'Balance', 'Status', 'Last Payment', 'Move In Date'];
  const allTenantsData = tenants.map((tenant) => {
    const apt = apartments.find((a) => a.id === tenant.apartmentId);
    return [
      tenant.name,
      tenant.email,
      tenant.phone,
      apt?.name || '',
      tenant.unitNumber,
      tenant.rentAmount,
      tenant.amountPaid,
      tenant.balance,
      tenant.paymentStatus,
      tenant.lastPaymentDate || '-',
      tenant.moveInDate,
    ];
  });

  // Create workbook and sheets
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Apartment Report sheet
  const apartmentSheet = XLSX.utils.aoa_to_sheet([apartmentHeaders, ...apartmentData]);
  XLSX.utils.book_append_sheet(workbook, apartmentSheet, 'Apartment Report');

  // Overdue Tenants sheet
  const overdueSheet = XLSX.utils.aoa_to_sheet([overdueHeaders, ...overdueData]);
  XLSX.utils.book_append_sheet(workbook, overdueSheet, 'Overdue Tenants');

  // All Tenants sheet
  const allTenantsSheet = XLSX.utils.aoa_to_sheet([allTenantsHeaders, ...allTenantsData]);
  XLSX.utils.book_append_sheet(workbook, allTenantsSheet, 'All Tenants');

  // Download
  XLSX.writeFile(workbook, `rental-report-${monthName.toLowerCase()}-2024.xlsx`);
};
