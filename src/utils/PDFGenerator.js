import jsPDF from 'jspdf';
import { COMPANY_INFO } from '@/constants/companyInfo';

export const generateQuotePDF = async (quote, clientData, drawingImage) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // Optimized margins
  const margin = 12;
  const topMargin = 10;
  const bottomMargin = 8;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for text alignment
  const rightAlign = (text, x, y) => {
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(text, x - textWidth, y);
  };

  const centerAlign = (text, y) => {
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Determine layout strategy
  const allItems = [
    ...(quote.calculatedMaterials || quote.materials || []),
    ...(quote.manualMaterials || [])
  ];
  const itemCount = allItems.length;
  const isCompactLayout = itemCount <= 12; // Single page target

  // --- HEADER SECTION (Compact) ---
  let currentY = topMargin + 5;

  // Company Logo/Name (Left)
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, margin, currentY);

  // Quote Metadata (Right)
  const displayId = quote.quoteNumber ? String(quote.quoteNumber).padStart(3, '0') : (quote.id ? (quote.id.length > 8 ? quote.id.slice(0, 8).toUpperCase() : quote.id) : '---');
  const dateStr = new Date(quote.date || Date.now()).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  doc.setFontSize(12);
  rightAlign(`Presupuesto #${displayId}`, pageWidth - margin, currentY);

  currentY += 5;

  // Company Contact (Left - Single Line if possible or compact block)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);

  doc.text(`${COMPANY_INFO.address} | ${COMPANY_INFO.phone}`, margin, currentY);
  doc.text(dateStr, pageWidth - margin - (doc.getStringUnitWidth(dateStr) * 8 / doc.internal.scaleFactor), currentY); // Date aligned right under title

  currentY += 4;
  doc.text(`${COMPANY_INFO.web} | IG: ${COMPANY_INFO.social.instagram}`, margin, currentY);
  doc.setTextColor(0);

  // --- CLIENT & SUMMARY BAR ---
  currentY += 6;
  const infoBoxHeight = 14;

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(220);
  doc.roundedRect(margin, currentY, contentWidth, infoBoxHeight, 1, 1, 'FD');

  // Client Info (Left side of box)
  const boxPadding = 3;
  const midPoint = margin + (contentWidth / 2);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE:", margin + boxPadding, currentY + 5);
  doc.text("TEL:", midPoint, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.text((clientData.name || "Consumidor Final").toUpperCase().substring(0, 35), margin + boxPadding + 15, currentY + 5);
  doc.text((clientData.phone || "---"), midPoint + 8, currentY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("DIRECCIÓN:", margin + boxPadding, currentY + 10);
  doc.setFont("helvetica", "normal");
  doc.text((clientData.address || "---").substring(0, 60), margin + boxPadding + 18, currentY + 10);

  currentY += infoBoxHeight + 5;

  // --- LAYOUT LOGIC ---
  // If compact layout, we might split width between table and drawing if drawing exists
  // For now, simpler approach: Full width table, drawing at bottom or page 2 if needed
  // BUT user requested: "Position drawing on right side... for single-page quotes" if items <= 12?
  // Actually, usually a Quote table needs full width for columns (Cant, Detalle, Unit, Total).
  // A two-column layout (Table Left, Drawing Right) is very tight for A4.
  // Better approach for Single Page: Table Top, Drawing Bottom (taking 40-50% height).

  // --- TABLE HEADER ---
  const colX = {
    cant: margin,
    detalle: margin + 12,
    precioUnit: pageWidth - margin - 35,
    precioTotal: pageWidth - margin
  };

  doc.setFillColor(50, 50, 50);
  doc.rect(margin, currentY, contentWidth, 6, 'F');

  doc.setTextColor(255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("CANT", colX.cant + 1, currentY + 4);
  doc.text("DETALLE DEL PRODUCTO", colX.detalle, currentY + 4);
  rightAlign("UNITARIO", colX.precioUnit, currentY + 4);
  rightAlign("TOTAL", colX.precioTotal - 2, currentY + 4);
  doc.setTextColor(0);

  currentY += 6;

  // --- TABLE CONTENT ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8); // Reduced font size

  let totalCalculated = 0;
  const rowHeight = 5.5; // Compressed row height
  const maxRowsPerColumn = isCompactLayout ? 16 : 35; // If compact, limit rows to leave room for drawing

  // If compact layout and we have drawing, we want to try to fit everything on page 1.
  // If not compact, we flow naturally.

  allItems.forEach((item, index) => {
    const qty = item.quantity || 0;
    const price = item.unitPrice || item.price || 0;
    const subtotal = item.subtotal || (qty * price);
    totalCalculated += subtotal;

    // Check page break
    if (currentY + rowHeight > pageHeight - bottomMargin - (isCompactLayout && drawingImage ? 100 : 30)) {
      // If compact mode and we run out of space, we might need a new page regardless
      // or if not compact, we just page break.
      doc.addPage();
      currentY = topMargin + 5;
      // Header reprint...
      doc.setFillColor(50, 50, 50);
      doc.rect(margin, currentY, contentWidth, 6, 'F');
      doc.setTextColor(255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("CANT", colX.cant + 1, currentY + 4);
      doc.text("DETALLE", colX.detalle, currentY + 4);
      rightAlign("UNITARIO", colX.precioUnit, currentY + 4);
      rightAlign("TOTAL", colX.precioTotal - 2, currentY + 4);
      doc.setTextColor(0);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }

    // Zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
    }

    doc.text(qty.toString(), colX.cant + 3, currentY + 4, { align: 'center' });

    // Truncate detail if too long to avoid multi-line in compact mode
    let detailText = item.name.toUpperCase() + (item.category ? ` (${item.category})` : '');
    const maxDetailWidth = colX.precioUnit - colX.detalle - 5;
    if (doc.getStringUnitWidth(detailText) * 8 / doc.internal.scaleFactor > maxDetailWidth) {
      // Simple truncate for compact
      const chars = Math.floor(maxDetailWidth / (4 / doc.internal.scaleFactor)); // approx
      detailText = detailText.substring(0, chars) + "...";
    }

    doc.text(detailText, colX.detalle, currentY + 4);

    rightAlign("$ " + price.toLocaleString('es-AR', { minimumFractionDigits: 0 }), colX.precioUnit, currentY + 4);
    rightAlign("$ " + subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0 }), colX.precioTotal - 2, currentY + 4);

    currentY += rowHeight;
  });

  // --- TOTALS & DRAWING LOGIC ---

  // Determine where to put drawing.
  // 1. If compact layout (<= 12 items) and drawing exists:
  //    - Try to put Drawing on the RIGHT side of Totals?
  //    - Or Drawing takes bottom half, Totals overlay or above?
  //    User request: "Position drawing on right side (two-column layout) for single-page quotes"
  //    This implies Totals might be on the Left? Or Totals above drawing?
  //    Let's try: Totals Section Left/Center, Drawing Right block.

  const minDrawingHeight = 80; // Requested minimum
  const availableY = pageHeight - currentY - bottomMargin;

  // Calculate final total Y position first to see where we stand
  const totalsHeight = 25; // Space for subtotal, total, payment text

  if (isCompactLayout && drawingImage && availableY > minDrawingHeight) {
    // === SINGLE PAGE OPTIMIZED LAYOUT ===
    // Draw separator
    doc.setDrawColor(200);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 5;

    // LEFT COLUMN: TOTALS & INFO
    const leftColWidth = (contentWidth * 0.4);
    const rightColX = margin + leftColWidth + 5;
    const rightColWidth = (contentWidth * 0.6) - 5; // Drawing gets 60% approx

    let totalsY = currentY;

    // Totals Block
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN:", margin, totalsY + 5);

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", margin, totalsY + 12);
    rightAlign("$ " + totalCalculated.toLocaleString('es-AR', { minimumFractionDigits: 2 }), margin + leftColWidth - 10, totalsY + 12);

    // Total Final Box
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, totalsY + 16, leftColWidth, 12, 1, 1, 'F');

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL FINAL", margin + 3, totalsY + 24);
    rightAlign("$ " + quote.total.toLocaleString('es-AR', { minimumFractionDigits: 2 }), margin + leftColWidth - 3, totalsY + 24);

    // Payment Text
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    const payText = doc.splitTextToSize("Forma de pago: Transferencia, Efectivo o Débito. Validez: 15 días.", leftColWidth);
    doc.text(payText, margin, totalsY + 34);

    // RIGHT COLUMN: DRAWING
    // Draw a box for the drawing
    const drawingBoxHeight = Math.min(availableY - 10, 100);

    try {
      const imgProps = doc.getImageProperties(drawingImage);
      const ratio = imgProps.width / imgProps.height;

      let imgW = rightColWidth;
      let imgH = imgW / ratio;

      if (imgH > drawingBoxHeight) {
        imgH = drawingBoxHeight;
        imgW = imgH * ratio;
      }

      // Center image in right column
      const imgX = rightColX + (rightColWidth - imgW) / 2;
      const imgY = currentY; // Align top with totals

      doc.addImage(drawingImage, 'PNG', imgX, imgY, imgW, imgH);

      // Label
      doc.setFontSize(6);
      doc.setTextColor(150);
      doc.text("Esquema de referencia", rightColX, imgY + imgH + 3);

    } catch (e) {
      console.error("Image add error", e);
    }

  } else {
    // === MULTI PAGE OR NO DRAWING LAYOUT ===
    // Standard totals at bottom of list
    currentY += 2;
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // Check space for totals
    if (currentY + 25 > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = topMargin + 10;
    }

    // Totals (Right Aligned compact)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    rightAlign("Subtotal: $ " + totalCalculated.toLocaleString('es-AR', { minimumFractionDigits: 2 }), pageWidth - margin, currentY + 5);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    currentY += 12;
    // Gray box background
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(pageWidth - margin - 80, currentY - 6, 80, 10, 1, 1, 'F');

    doc.text("TOTAL FINAL", pageWidth - margin - 75, currentY + 1);
    rightAlign("$ " + quote.total.toLocaleString('es-AR', { minimumFractionDigits: 2 }), pageWidth - margin - 2, currentY + 1);

    currentY += 8;
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    rightAlign("Forma de pago: Transferencia, Efectivo o Débito. Validez: 15 días.", pageWidth - margin, currentY);

    // Drawing on new page or bottom if massive space
    if (drawingImage) {
      // Always new page for drawing if not compact mode, to ensure size
      doc.addPage();

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("PLANO DE REFERENCIA", margin, topMargin + 10);

      const drawY = topMargin + 15;
      const availH = pageHeight - drawY - bottomMargin;
      const availW = contentWidth;

      try {
        const imgProps = doc.getImageProperties(drawingImage);
        const ratio = imgProps.width / imgProps.height;

        let imgW = availW;
        let imgH = imgW / ratio;

        if (imgH > availH) {
          imgH = availH;
          imgW = imgH * ratio;
        }

        const imgX = margin + (availW - imgW) / 2;
        doc.addImage(drawingImage, 'PNG', imgX, drawY, imgW, imgH);
      } catch (e) { }
    }
  }

  // --- FOOTER ---
  const footerY = pageHeight - 5;
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180);
  centerAlign(`Generado por ${COMPANY_INFO.name} - Documento no válido como factura`, footerY);

  doc.save(`Presupuesto_${displayId}.pdf`);
};