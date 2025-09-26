'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouteStore } from '@/store/useRouteStore';
import { calculateDeliveryPrice } from '@/lib/deliveryPricing';

export default function DeliveryPricing() {
  const { pricing, totalDistanceMeters, totalDurationSec } = useRouteStore();
  const [baseFee, setBaseFee] = useState(pricing.baseFee.toString());
  const [pricePerKm, setPricePerKm] = useState(pricing.pricePerKm.toString());
  const [rushHourFee, setRushHourFee] = useState(pricing.rushHourFee.toString());

  const deliveryPrice = totalDistanceMeters > 0
    ? calculateDeliveryPrice(totalDistanceMeters, totalDurationSec, pricing)
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="baseFee">Taxa Base (R$)</Label>
          <Input
            id="baseFee"
            type="number"
            step="0.50"
            value={baseFee}
            onChange={(e) => setBaseFee(e.target.value)}
            placeholder="5.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerKm">Preço por KM (R$)</Label>
          <Input
            id="pricePerKm"
            type="number"
            step="0.50"
            value={pricePerKm}
            onChange={(e) => setPricePerKm(e.target.value)}
            placeholder="2.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rushHourFee">Taxa Horário Pico (%)</Label>
          <Input
            id="rushHourFee"
            type="number"
            step="5"
            value={rushHourFee}
            onChange={(e) => setRushHourFee(e.target.value)}
            placeholder="20"
          />
        </div>
      </div>

      {deliveryPrice && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Detalhes do Preço</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Taxa Base:</span>
              <span>R$ {deliveryPrice.baseCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Distância ({deliveryPrice.distance} km):</span>
              <span>R$ {deliveryPrice.distanceCost.toFixed(2)}</span>
            </div>
            {deliveryPrice.rushHourCost > 0 && (
              <div className="flex justify-between text-yellow-600 dark:text-yellow-400">
                <span>Taxa Horário de Pico:</span>
                <span>R$ {deliveryPrice.rushHourCost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
              <span>Total:</span>
              <span>R$ {deliveryPrice.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}