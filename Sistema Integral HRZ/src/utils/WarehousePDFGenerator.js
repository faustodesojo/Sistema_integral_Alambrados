import jsPDF from 'jspdf';
import { COMPANY_INFO } from '@/constants/companyInfo';

export const generateWarehousePDF = async (order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const margin = 15;
  let currentY = 15;

  // --- HEADER ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ORDEN DE PREPARACIÓN", margin, currentY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Orden #${order.number}`, pageWidth - margin, currentY, { align: 'right' });
  
  currentY += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${COMPANY_INFO.name} - Depósito`, margin, currentY);
  doc.text(`Fecha: ${new Date(order.date).toLocaleDateString('es-AR')}`, pageWidth - margin, currentY, { align: 'right' });
  
  // --- INFO BOX ---
  currentY += 10;
  doc.setDrawColor(200);
  doc.setFillColor(248, 248, 248);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 25, 'FD');
  
  doc.setTextColor(0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  
  // Row 1
  doc.text("CLIENTE:", margin + 5, currentY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(order.clientName || '---', margin + 35, currentY + 7);
  
  // Row 2
  doc.setFont("helvetica", "bold");
  doc.text("REF. PRESUPUESTO:", margin + 5, currentY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(`#${order.quoteId} (Original: #${order.quoteNumber || '---'})`, margin + 45, currentY + 14);
  
  // Row 3
  doc.setFont("helvetica", "bold");
  doc.text("TIPO DE ORDEN:", margin + 5, currentY + 21);
  doc.setFont("helvetica", "normal");
  doc.text((order.type === 'partial' ? 'PARCIAL' : 'COMPLETA').toUpperCase(), margin + 35, currentY + 21);
  
  // --- TABLE HEADER ---
  currentY += 35;
  
  const colX = {
    check: margin,
    qty: margin + 15,
    desc: margin + 40,
    cat: pageWidth - margin - 40
  };

  doc.setFillColor(50, 50, 50);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
  
  doc.setTextColor(255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("[ ]", colX.check + 2, currentY + 5);
  doc.text("CANT", colX.qty, currentY + 5);
  doc.text("DESCRIPCIÓN DEL MATERIAL", colX.desc, currentY + 5);
  doc.text("CATEGORÍA", colX.cat, currentY + 5);

  currentY += 8;
  
  // --- ITEMS ---
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  (order.items || []).forEach((item, index) => {
    // Zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
    }

    // Checkbox square
    doc.setDrawColor(0);
    doc.rect(colX.check + 2, currentY + 2, 4, 4);

    // Qty
    doc.setFont("helvetica", "bold");
    doc.text(String(item.quantity), colX.qty + 2, currentY + 5);
    
    // Name
    doc.setFont("helvetica", "normal");
    doc.text(item.name.substring(0, 55), colX.desc, currentY + 5);
    
    // Category
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(item.category || 'General', colX.cat, currentY + 5);
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    
    currentY += 8;

    // Page break check
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
    }
  });

  // --- FOOTER ---
  const footerY = pageHeight - 20;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(8);
  doc.text("Firma de quien retira:", margin, footerY + 5);
  doc.text("Firma de quien entrega:", pageWidth / 2, footerY + 5);

  doc.save(`Orden_Deposito_${order.number}.pdf`);
};