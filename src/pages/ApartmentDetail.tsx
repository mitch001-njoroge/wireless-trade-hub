import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentStatusBadge } from '@/components/dashboard/PaymentStatusBadge';
import { getApartmentById, getTenantsByApartment, formatCurrency } from '@/lib/data';
import { ArrowLeft, Building2, Phone, Mail, Calendar } from 'lucide-react';

const ApartmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const apartment = getApartmentById(id || '');
  const tenantsList = getTenantsByApartment(id || '');

  if (!apartment) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-foreground">Apartment not found</h1>
          <Link to="/apartments">
            <Button className="mt-4">Back to Apartments</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/apartments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{apartment.name}</h1>
              <p className="text-muted-foreground">{apartment.address}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Units</p>
              <p className="text-2xl font-bold text-foreground">{apartment.totalUnits}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Occupied Units</p>
              <p className="text-2xl font-bold text-foreground">{apartment.occupiedUnits}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(apartment.monthlyRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tenants List */}
        <Card>
          <CardHeader>
            <CardTitle>Tenants ({tenantsList.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tenantsList.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tenants in this apartment</p>
            ) : (
              <div className="space-y-4">
                {tenantsList.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            Unit {tenant.unitNumber}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {tenant.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {tenant.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Move-in: {tenant.moveInDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Rent Due</p>
                          <p className="font-semibold text-foreground">{formatCurrency(tenant.rentAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-semibold text-foreground">{formatCurrency(tenant.balance)}</p>
                        </div>
                        <PaymentStatusBadge status={tenant.paymentStatus} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ApartmentDetail;
