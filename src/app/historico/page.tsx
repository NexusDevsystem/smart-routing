'use client';

import { useEffect, useState, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { localdb } from '@/lib/localdb';
import { formatDate, formatDistance, formatDuration } from '@/lib/format';
import { toast } from 'sonner';
import type { HistoryEntry } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function HistoricoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const loadPlans = () => {
    try {
      const plans = localdb.getPlanIndex();
      setPlans(plans.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      toast.error('Erro ao carregar planos');
      console.error('Load plans error:', error);
    }
  };

  const handleOpenPlan = async (id: string) => {
    setLoading(true);
    try {
      const plan = await localdb.getPlan(id);
      if (plan) {
        router.push(`/?plan=${id}`);
      } else {
        toast.error('Plano não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao abrir plano');
      console.error('Open plan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicatePlan = async (id: string) => {
    try {
      const newId = await localdb.duplicatePlan(id);
      if (newId) {
        toast.success('Plano duplicado com sucesso!');
        loadPlans();
      }
    } catch (error) {
      toast.error('Erro ao duplicar plano');
      console.error('Duplicate plan error:', error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await localdb.deletePlan(id);
      toast.success('Plano excluído com sucesso!');
      loadPlans();
      setShowDeleteDialog(false);
      setPlanToDelete(null);
    } catch (error) {
      toast.error('Erro ao excluir plano');
      console.error('Delete plan error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Histórico de Planos</h1>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="text-center">Paradas</TableHead>
              <TableHead>Distância</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{formatDate(plan.createdAt)}</TableCell>
                <TableCell>{plan.city}</TableCell>
                <TableCell className="text-center">{plan.stopsCount}</TableCell>
                <TableCell>{formatDistance(plan.totalDistanceMeters)}</TableCell>
                <TableCell>{formatDuration(plan.totalDurationSec)}</TableCell>
                <TableCell className="text-right">
                  <div className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPlan(plan.id)}
                      disabled={loading}
                    >
                      Abrir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicatePlan(plan.id)}
                      disabled={loading}
                    >
                      Duplicar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPlanToDelete(plan.id);
                        setShowDeleteDialog(true);
                      }}
                      disabled={loading}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum plano salvo
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir este plano?</p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => planToDelete && handleDeletePlan(planToDelete)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function HistoricoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoricoContent />
    </Suspense>
  );
}