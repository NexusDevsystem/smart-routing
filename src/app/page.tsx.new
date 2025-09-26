'use client';

import { Card } from '@/components/ui/card';
import StopsForm from '@/components/routes/StopsForm';
import StopsTable from '@/components/routes/StopsTable';
import OptimizePanel from '@/components/routes/OptimizePanel';
import GoogleMap from '@/components/map/GoogleMap';
import { useRouteStore } from '@/store/useRouteStore';

export default function Home() {
  const { stops } = useRouteStore();

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <Card className="p-6">
          <GoogleMap />
        </Card>

        <div className="space-y-8">
          <Card className="p-6">
            <StopsForm />
          </Card>

          {stops.length > 0 && (
            <Card className="p-6">
              <OptimizePanel />
            </Card>
          )}
        </div>
      </div>

      {stops.length > 0 && (
        <Card className="p-6">
          <StopsTable />
        </Card>
      )}
    </div>
  );
}