'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouteStore } from '@/store/useRouteStore';
import { toast } from 'sonner';
import { calculateDistanceMatrix } from '@/lib/distanceMatrix';
import { optimizeRoute } from '@/lib/tsp';
import { formatDistance, formatDuration } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { DialogTrigger, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, DownloadIcon, Save } from 'lucide-react';
import { localdb } from '@/lib/localdb';
import { exportCsv } from '@/lib/exportCsv';
import { exportPdf } from '@/lib/exportPdf';

export default function OptimizePanel() {
  const { 
    stops, 
    origin, 
    returnToStart, 
    setReturnToStart,
    optimizing,
    setOptimizing,
    totalDistanceMeters,
    totalDurationSec,
    loading 
  } = useRouteStore();
  const [planName, setPlanName] = useState('');

  const handleOptimize = async () => {
    if (stops.length < 2) {
      toast.error('Adicione pelo menos 2 paradas para otimizar');
      return;
    }

    setOptimizing(true);
    try {
      const allStops = origin ? [origin, ...stops] : stops;
      
      // Calculate distance/duration matrix
      const matrix = await calculateDistanceMatrix(allStops);
      
      // Optimize route
      const { route, totalDistanceMeters, totalDurationSec, violations } = optimizeRoute(
        allStops,
        matrix.distances,
        matrix.durations,
        returnToStart
      );

      // Show violations if any
      if (violations.length > 0) {
        toast.warning(`${violations.length} janelas de entrega violadas`, {
          description: 'Algumas entregas podem chegar fora do horário previsto',
        });
      }

      // TODO: Update store with optimized route
      
      toast.success('Rota otimizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao otimizar rota');
      console.error('Optimization error:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      toast.error('Digite um nome para o plano');
      return;
    }

    try {
      const plan = {
        id: crypto.randomUUID(),
        name: planName.trim(),
        createdAt: new Date().toISOString(),
        origin,
        returnToStart,
        stops,
        totalDistanceMeters,
        totalDurationSec,
        city: 'Unknown', // TODO: Get city from geocoding response
        version: 1,
      };

      await localdb.savePlan(plan);
      toast.success('Plano salvo com sucesso!');
      setPlanName('');
    } catch (error) {
      toast.error('Erro ao salvar plano');
      console.error('Save error:', error);
    }
  };

  const handleExportCsv = async () => {
    try {
      await exportCsv(stops, totalDistanceMeters, totalDurationSec);
      toast.success('CSV exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
      console.error('CSV export error:', error);
    }
  };

  const handleExportPdf = async () => {
    try {
      await exportPdf(stops, totalDistanceMeters, totalDurationSec);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
      console.error('PDF export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="return-to-start"
            checked={returnToStart}
            onCheckedChange={setReturnToStart}
            disabled={optimizing}
          />
          <Label htmlFor="return-to-start">Retornar à origem</Label>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleOptimize} 
            disabled={loading || optimizing || stops.length < 2}
          >
            {optimizing ? 'Otimizando...' : 'Otimizar Rota'}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={loading || stops.length < 2}>
                <Save size={16} className="mr-2" />
                Salvar Plano
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar Plano</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-name">Nome do Plano</Label>
                  <input
                    type="text"
                    id="plan-name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Ex: Entregas Centro - 26/09"
                  />
                </div>
                <Button onClick={handleSavePlan} className="w-full">
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={loading || stops.length < 2}
            >
              <DownloadIcon size={16} className="mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPdf}
              disabled={loading || stops.length < 2}
            >
              <DownloadIcon size={16} className="mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {totalDistanceMeters > 0 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Distância Total:</span>
              <strong>{formatDistance(totalDistanceMeters)}</strong>
            </div>
            <ArrowRight className="hidden sm:block text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Duração Total:</span>
              <strong>{formatDuration(totalDurationSec)}</strong>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}