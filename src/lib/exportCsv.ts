import type { Stop } from '@/lib/types';
import { formatDistance, formatDuration } from '@/lib/format';

export async function exportCsv(
  stops: Stop[],
  totalDistanceMeters: number,
  totalDurationSec: number
) {
  // Create CSV header
  const header = [
    'ordem',
    'label',
    'address',
    'lat',
    'lng',
    'janela_inicio',
    'janela_fim',
    'eta',
    'dist_prev_m',
    'dist_total_m',
  ].join(',');

  // Create CSV rows
  const rows = stops.map((stop, index) => {
    const eta = ''; // TODO: Calculate ETA when optimization is done
    const distToPrev = index > 0 ? '0' : ''; // TODO: Calculate when optimization is done
    
    return [
      index + 1,
      stop.label,
      `"${stop.address}"`,
      stop.lat,
      stop.lng,
      stop.windowStart || '',
      stop.windowEnd || '',
      eta,
      distToPrev,
      index === stops.length - 1 ? totalDistanceMeters : '',
    ].join(',');
  });

  // Create CSV content
  const content = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `smart-routing-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}