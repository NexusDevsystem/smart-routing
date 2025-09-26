'use client';

import { Card } from '@/components/ui/card';
import StopsForm from '@/components/routes/StopsForm';
import StopsTable from '@/components/routes/StopsTable';
import OptimizePanel from '@/components/routes/OptimizePanel';
import GoogleMap from '@/components/map/GoogleMap';
import DeliveryPricing from '@/components/delivery/DeliveryPricing';
import { useRouteStore } from '@/store/useRouteStore';

export default function Home() {
  const { stops } = useRouteStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Delivery Route
          <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-4">
            Calcule rotas e preços de entrega
          </span>
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            <Card className="p-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <div className="h-[600px]">
                <GoogleMap />
              </div>
            </Card>

            {stops.length > 0 && (
              <Card className="p-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <h2 className="text-xl font-semibold mb-4">Detalhes da Entrega</h2>
                <DeliveryPricing />
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <Card className="p-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <h2 className="text-xl font-semibold mb-4">Novo Pedido</h2>
              <StopsForm />
            </Card>

            {stops.length > 0 && (
              <Card className="p-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <h2 className="text-xl font-semibold mb-4">Otimizar Rota</h2>
                <OptimizePanel />
              </Card>
            )}
          </div>
        </div>

        {stops.length > 0 && (
          <Card className="p-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4">Pedidos em Rota</h2>
            <StopsTable />
          </Card>
        )}
      </div>
    </div>
  );
}