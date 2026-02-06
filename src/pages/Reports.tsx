import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apartments, loadTenants, formatCurrency, getTenantsByApartment } from '@/lib/data';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';
import { Download, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { format, subMonths, startOfMonth } from 'date-fns';

const Reports = () => {
  // Generate last 12 months for dropdown
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(startOfMonth(now), i);
      return {
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      };
    });
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(months[0]?.value || '');
  const [selectedApartment, setSelectedApartment] = useState('all');

  const tenants = loadTenants();
  const overdueTenants = tenants.filter((t) => t.paymentStatus === 'unpaid' || t.paymentStatus === 'partial');

  const handleDownloadPDF = () => {
    try {
      exportToPDF(selectedMonth);
      toast({
        title: 'PDF Downloaded',
        description: 'Your PDF report has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadExcel = () => {
    try {
      exportToExcel(selectedMonth);
      toast({
        title: 'Excel Downloaded',
        description: 'Your Excel report has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate Excel report.',
        variant: 'destructive',
      });
    }
  };

  const getApartmentStats = (apartmentId: string) => {
    const apt = apartments.find((a) => a.id === apartmentId);
    const aptTenants = getTenantsByApartment(apartmentId);
    const paid = aptTenants.filter((t) => t.paymentStatus === 'paid').length;
    const partial = aptTenants.filter((t) => t.paymentStatus === 'partial').length;
    const unpaid = aptTenants.filter((t) => t.paymentStatus === 'unpaid').length;

    return {
      name: apt?.name || '',
      expected: apt?.monthlyRevenue || 0,
      collected: apt?.collectedRevenue || 0,
      paid,
      partial,
      unpaid,
      total: aptTenants.length,
    };
  };

  return (
    <Layout>
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and download rental reports</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleDownloadExcel}>
              <FileText className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedApartment} onValueChange={setSelectedApartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Apartment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apartments</SelectItem>
              {apartments.map((apt) => (
                <SelectItem key={apt.id} value={apt.id}>
                  {apt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expected</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(apartments.reduce((sum, apt) => sum + apt.monthlyRevenue, 0))}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(apartments.reduce((sum, apt) => sum + apt.collectedRevenue, 0))}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(
                      apartments.reduce((sum, apt) => sum + (apt.monthlyRevenue - apt.collectedRevenue), 0)
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Per-Apartment Report */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Rent Report by Apartment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Apartment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Expected</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Collected</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Outstanding</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paid</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Partial</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Unpaid</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {apartments.map((apt) => {
                    const stats = getApartmentStats(apt.id);
                    const rate = ((stats.collected / stats.expected) * 100).toFixed(0);
                    return (
                      <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-4 px-4 font-medium text-foreground">{stats.name}</td>
                        <td className="py-4 px-4 text-foreground">{formatCurrency(stats.expected)}</td>
                        <td className="py-4 px-4 text-success font-medium">{formatCurrency(stats.collected)}</td>
                        <td className="py-4 px-4 text-destructive font-medium">
                          {formatCurrency(stats.expected - stats.collected)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                            {stats.paid}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                            {stats.partial}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                            {stats.unpaid}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-foreground">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tenants */}
        <Card className="border-warning/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle>Overdue Tenants Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {overdueTenants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No overdue tenants</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tenant</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Apartment</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Unit</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueTenants.map((tenant) => {
                      const apt = apartments.find((a) => a.id === tenant.apartmentId);
                      return (
                        <tr key={tenant.id} className="border-b border-border last:border-0">
                          <td className="py-4 px-4 font-medium text-foreground">{tenant.name}</td>
                          <td className="py-4 px-4 text-foreground">{apt?.name}</td>
                          <td className="py-4 px-4 text-foreground">{tenant.unitNumber}</td>
                          <td className="py-4 px-4 text-destructive font-medium">{formatCurrency(tenant.balance)}</td>
                          <td className="py-4 px-4 text-muted-foreground">{tenant.lastPaymentDate || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
