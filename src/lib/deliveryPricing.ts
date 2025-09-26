export interface DeliveryPricing {
  baseFee: number;        // Taxa base de entrega
  pricePerKm: number;     // Preço por quilômetro
  minDistance: number;    // Distância mínima cobrada
  rushHourFee: number;    // Taxa adicional em horário de pico (%)
}

export interface DeliveryCalculation {
  distance: number;       // Distância em km
  duration: number;       // Tempo estimado em minutos
  baseCost: number;      // Custo base
  distanceCost: number;  // Custo da distância
  rushHourCost: number;  // Custo adicional de horário de pico
  totalCost: number;     // Custo total
}

const DEFAULT_PRICING: DeliveryPricing = {
  baseFee: 5.00,         // R$ 5,00 de taxa base
  pricePerKm: 2.00,      // R$ 2,00 por km
  minDistance: 1.5,      // Mínimo de 1.5 km
  rushHourFee: 20,       // 20% adicional em horário de pico
};

export function calculateDeliveryPrice(
  distanceInMeters: number,
  durationInSeconds: number,
  pricing: DeliveryPricing = DEFAULT_PRICING
): DeliveryCalculation {
  const distanceInKm = distanceInMeters / 1000;
  const durationInMinutes = Math.ceil(durationInSeconds / 60);

  // Aplica distância mínima
  const chargeableDistance = Math.max(distanceInKm, pricing.minDistance);

  // Calcula custo base
  const baseCost = pricing.baseFee;

  // Calcula custo da distância
  const distanceCost = chargeableDistance * pricing.pricePerKm;

  // Verifica se é horário de pico (seg-sex, 11:30-14:00 e 18:30-21:00)
  const now = new Date();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hour * 60 + minutes;
  
  const isLunchRush = timeInMinutes >= 11 * 60 + 30 && timeInMinutes <= 14 * 60;
  const isDinnerRush = timeInMinutes >= 18 * 60 + 30 && timeInMinutes <= 21 * 60;
  
  const isRushHour = isWeekday && (isLunchRush || isDinnerRush);

  // Calcula taxa de horário de pico
  const rushHourCost = isRushHour ? (baseCost + distanceCost) * (pricing.rushHourFee / 100) : 0;

  // Calcula custo total
  const totalCost = baseCost + distanceCost + rushHourCost;

  return {
    distance: Number(distanceInKm.toFixed(2)),
    duration: durationInMinutes,
    baseCost: Number(baseCost.toFixed(2)),
    distanceCost: Number(distanceCost.toFixed(2)),
    rushHourCost: Number(rushHourCost.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2))
  };
}