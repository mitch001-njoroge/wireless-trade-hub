import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { apartments, getTenantsByApartment, formatCurrency } from '@/lib/data';
import { Building2, Users, MapPin, ArrowRight } from 'lucide-react';

const Apartments = () => {
  return (
    <Layout>
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Apartments</h1>
            <p className="text-muted-foreground">Manage your property portfolio</p>
          </div>
        </div>

        {/* Apartments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apartments.map((apartment) => {
            const tenantsList = getTenantsByApartment(apartment.id);
            const collectionRate = (apartment.collectedRevenue / apartment.monthlyRevenue) * 100;
            const occupancyRate = (apartment.occupiedUnits / apartment.totalUnits) * 100;

            return (
              <Card key={apartment.id} className="animate-fade-in hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{apartment.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {apartment.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Occupancy</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {apartment.occupiedUnits}/{apartment.totalUnits}
                      </p>
                      <Progress value={occupancyRate} className="h-1.5 mt-2" />
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Monthly Revenue</p>
                      <p className="text-xl font-bold text-foreground">
                        {formatCurrency(apartment.collectedRevenue)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        of {formatCurrency(apartment.monthlyRevenue)}
                      </p>
                    </div>
                  </div>

                  {/* Collection Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Collection Rate</span>
                      <span className="font-medium text-foreground">{collectionRate.toFixed(0)}%</span>
                    </div>
                    <Progress value={collectionRate} className="h-2" />
                  </div>

                  {/* Action */}
                  <Link to={`/apartments/${apartment.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Apartments;
