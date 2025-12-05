import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apartments, formatCurrency } from '@/lib/data';
import { Building2, ArrowRight } from 'lucide-react';

export function ApartmentOverview() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Apartments Overview</CardTitle>
        <Link
          to="/apartments"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {apartments.map((apartment) => {
            const collectionRate = (apartment.collectedRevenue / apartment.monthlyRevenue) * 100;
            return (
              <div key={apartment.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{apartment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {apartment.occupiedUnits}/{apartment.totalUnits} units occupied
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(apartment.collectedRevenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {formatCurrency(apartment.monthlyRevenue)}
                    </p>
                  </div>
                </div>
                <Progress value={collectionRate} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
