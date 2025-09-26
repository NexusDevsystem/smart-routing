'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouteStore } from '@/store/useRouteStore';
import { toast } from 'sonner';
import { stopsFormSchema, type StopsFormData } from '@/lib/validations';
import { geocodeAddress } from '@/lib/geocode';

export default function StopsForm() {
  const { stops, addStop, loading, setLoading } = useRouteStore();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  const form = useForm<StopsFormData>({
    resolver: zodResolver(stopsFormSchema),
    defaultValues: {
      addressInput: '',
      cep: '',
      number: '',
      label: '',
      windowStart: '',
      windowEnd: '',
    },
  });

  useEffect(() => {
    // Initialize Google Places Autocomplete
    const input = document.getElementById('addressInput') as HTMLInputElement;
    if (input && window.google) {
      const options = {
        componentRestrictions: { country: 'BR' },
        types: ['address'],
      };
      const autocomplete = new google.maps.places.Autocomplete(input, options);
      setAutocomplete(autocomplete);
    }
  }, []);

  const onSubmit = async (data: StopsFormData) => {
    try {
      setLoading(true);
      
      // Generate stop ID
      const stopId = crypto.randomUUID();
      
      // Determine which address to geocode
      let addressToGeocode = '';
      if (data.cep && data.number) {
        // Format CEP + number
        const formattedCep = data.cep.replace(/\D/g, '');
        addressToGeocode = `${formattedCep} ${data.number}, Brasil`;
      } else {
        addressToGeocode = data.addressInput;
      }
      
      // Geocode the address
      const { lat, lng, address, city } = await geocodeAddress(addressToGeocode);
      
      // Add stop to store
      addStop({
        id: stopId,
        label: data.label,
        address,
        lat,
        lng,
        windowStart: data.windowStart,
        windowEnd: data.windowEnd,
      });
      
      // Reset form
      form.reset();
      
      toast.success('Parada adicionada com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar parada');
    } finally {
      setLoading(false);
    }
  };

  const onCEPInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, '');
    if (cep.length > 8) cep = cep.slice(0, 8);
    form.setValue('cep', cep);
  };

  const onTimeInput = (field: 'windowStart' | 'windowEnd', value: string) => {
    const time = value.replace(/\D/g, '');
    if (time.length <= 4) {
      const formatted = time
        .padEnd(4, '0')
        .replace(/(\d{2})(\d{2})/, '$1:$2')
        .slice(0, 5);
      form.setValue(field, formatted);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="addressInput">Endereço</Label>
          <Input
            id="addressInput"
            {...form.register('addressInput')}
            placeholder="Digite o endereço"
            disabled={loading}
          />
          {form.formState.errors.addressInput && (
            <p className="text-sm text-destructive">
              {form.formState.errors.addressInput.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>CEP + Número</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                {...form.register('cep')}
                placeholder="CEP (somente números)"
                onChange={onCEPInput}
                maxLength={8}
                disabled={loading}
              />
              {form.formState.errors.cep && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cep.message}
                </p>
              )}
            </div>
            <div className="w-24">
              <Input
                {...form.register('number')}
                placeholder="Nº"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="label">Apelido da Parada</Label>
          <Input
            id="label"
            {...form.register('label')}
            placeholder="Ex: Loja Centro"
            disabled={loading}
          />
          {form.formState.errors.label && (
            <p className="text-sm text-destructive">
              {form.formState.errors.label.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Janela de Entrega (opcional)</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                {...form.register('windowStart')}
                placeholder="Início (HH:mm)"
                onChange={(e) => onTimeInput('windowStart', e.target.value)}
                disabled={loading}
              />
              {form.formState.errors.windowStart && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.windowStart.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Input
                {...form.register('windowEnd')}
                placeholder="Fim (HH:mm)"
                onChange={(e) => onTimeInput('windowEnd', e.target.value)}
                disabled={loading}
              />
              {form.formState.errors.windowEnd && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.windowEnd.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="submit" disabled={loading}>
          Adicionar Parada
        </Button>
        <div className="space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {/* TODO: Import CSV */}}
            disabled={loading}
          >
            Importar CSV
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {/* TODO: Clear stops */}}
            disabled={loading}
          >
            Limpar Tudo
          </Button>
        </div>
      </div>
    </form>
  );
}