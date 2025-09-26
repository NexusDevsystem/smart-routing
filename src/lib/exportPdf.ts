import type { Stop } from '@/lib/types';
import { formatDistance, formatDuration, formatDate } from '@/lib/format';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export async function exportPdf(
  stops: Stop[],
  totalDistanceMeters: number,
  totalDurationSec: number
) {
  // Create PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Add title
  doc.setFontSize(20);
  doc.text('Smart Routing - Plano de Entregas', pageWidth / 2, 20, { align: 'center' });
  
  // Add metadata
  doc.setFontSize(12);
  doc.text(`Data: ${formatDate(new Date().toISOString())}`, 20, 40);
  doc.text(`Total de Paradas: ${stops.length}`, 20, 50);
  doc.text(`Distância Total: ${formatDistance(totalDistanceMeters)}`, 20, 60);
  doc.text(`Duração Total: ${formatDuration(totalDurationSec)}`, 20, 70);
  
  // Create QR code with deep link
  const qrCodeUrl = `${window.location.origin}/historico?id=123`; // TODO: Add real plan ID
  const qrDataUrl = await QRCode.toDataURL(qrCodeUrl);
  doc.addImage(qrDataUrl, 'PNG', pageWidth - 50, 30, 30, 30);
  
  // Add stops table
  const tableHeaders = ['Ordem', 'Local', 'Endereço', 'Janela'];
  const tableData = stops.map((stop, index) => [
    `${index + 1}`,
    stop.label,
    stop.address,
    stop.windowStart ? `${stop.windowStart} - ${stop.windowEnd}` : '-',
  ]);
  
  // Simple table implementation
  const startY = 90;
  const rowHeight = 10;
  const colWidths = [15, 40, 95, 40];
  let currentY = startY;
  
  // Draw headers
  doc.setFont('helvetica', 'bold');
  tableHeaders.forEach((header, i) => {
    const x = 20 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(header, x, currentY);
  });
  
  // Draw rows
  doc.setFont('helvetica', 'normal');
  tableData.forEach((row, rowIndex) => {
    currentY = startY + (rowIndex + 1) * rowHeight;
    
    // Add new page if needed
    if (currentY > doc.internal.pageSize.height - 20) {
      doc.addPage();
      currentY = 20;
    }
    
    row.forEach((cell, i) => {
      const x = 20 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(cell.toString(), x, currentY, {
        maxWidth: colWidths[i] - 2,
      });
    });
  });
  
  // Save PDF
  doc.save(`smart-routing-${new Date().toISOString().split('T')[0]}.pdf`);
}