import { jsPDF } from 'jspdf';
import { InvoiceRecord } from '../types';
import logoImage from '../assets/images/actionscribe_clean_logo_1789724989077.jpg';

// Preload the logo image in memory for instant, seamless PDF generation
let cachedLogoImg: HTMLImageElement | null = null;
if (typeof window !== 'undefined') {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { cachedLogoImg = img; };
  img.src = logoImage || '/logo.jpg';
}

function loadLogoImageAsync(): Promise<HTMLImageElement | null> {
  if (cachedLogoImg && cachedLogoImg.complete && cachedLogoImg.naturalWidth > 0) {
    return Promise.resolve(cachedLogoImg);
  }
  if (typeof window === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedLogoImg = img;
      resolve(img);
    };
    img.onerror = () => {
      // Fallback to public root logo
      const img2 = new Image();
      img2.crossOrigin = 'anonymous';
      img2.onload = () => {
        cachedLogoImg = img2;
        resolve(img2);
      };
      img2.onerror = () => resolve(null);
      img2.src = '/logo.jpg';
    };
    img.src = logoImage || '/logo.jpg';
  });
}

function drawVectorLogoFallback(doc: jsPDF, x: number, y: number, size: number): void {
  // Brand container with vibrant indigo background
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.roundedRect(x, y, size, size, 2.5, 2.5, 'F');

  // Crisp White 'A' chevron path
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.1);
  doc.line(x + size * 0.22, y + size * 0.8, x + size * 0.5, y + size * 0.22);
  doc.line(x + size * 0.5, y + size * 0.22, x + size * 0.78, y + size * 0.8);
  doc.line(x + size * 0.34, y + size * 0.62, x + size * 0.66, y + size * 0.62);

  // Cyan checkmark
  doc.setDrawColor(56, 189, 248); // Sky 400
  doc.setLineWidth(1.0);
  doc.line(x + size * 0.38, y + size * 0.54, x + size * 0.5, y + size * 0.68);
  doc.line(x + size * 0.5, y + size * 0.68, x + size * 0.75, y + size * 0.42);
}

export async function generateInvoicePDF(invoice: InvoiceRecord): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2; // 178mm

  // 1. Top Decorative Executive Accent Bar (Full Width Dual Tone, Perfectly Aligned)
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 4, 'F');
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 4, pageWidth, 1.5, 'F');

  // 2. Company Brand Logo & Header
  const logoImg = await loadLogoImageAsync();
  const logoX = margin;
  const logoY = 12;
  const logoSize = 15;

  if (logoImg && logoImg.naturalWidth > 0) {
    try {
      // Crisp white card container with subtle border for high-end look
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 2.5, 2.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 2.5, 2.5, 'D');

      doc.addImage(logoImg, 'JPEG', logoX + 0.5, logoY + 0.5, logoSize - 1, logoSize - 1);
    } catch {
      drawVectorLogoFallback(doc, logoX, logoY, logoSize);
    }
  } else {
    drawVectorLogoFallback(doc, logoX, logoY, logoSize);
  }

  // Brand Name & Details (Clean vertical alignment beside logo)
  const brandTextX = margin + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('ActionScribe', brandTextX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Enterprise Meeting Intelligence & Workspace Recaps', brandTextX, 22.5);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Merchant Contact: vikasverm48472@gmail.com | https://actionscribe.ai', brandTextX, 26.5);

  // 3. Document Title & Status Pill (Right Aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('TAX INVOICE', pageWidth - margin, 18, { align: 'right' });

  // Status Badge Pill
  const isPaid = invoice.status === 'paid';
  const isPending = invoice.status === 'pending_verification';

  if (isPaid) {
    const pillWidth = 34;
    const pillX = pageWidth - margin - pillWidth;
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.roundedRect(pillX, 21.5, pillWidth, 6.8, 1.8, 1.8, 'F');
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.setLineWidth(0.3);
    doc.roundedRect(pillX, 21.5, pillWidth, 6.8, 1.8, 1.8, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text('PAID & ACTIVE', pillX + pillWidth / 2, 26, { align: 'center' });
  } else if (isPending) {
    const pillWidth = 46;
    const pillX = pageWidth - margin - pillWidth;
    doc.setFillColor(254, 243, 199); // Amber 50
    doc.roundedRect(pillX, 21.5, pillWidth, 6.8, 1.8, 1.8, 'F');
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.setLineWidth(0.3);
    doc.roundedRect(pillX, 21.5, pillWidth, 6.8, 1.8, 1.8, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text('PENDING VERIFICATION', pillX + pillWidth / 2, 26, { align: 'center' });
  } else {
    const pillWidth = 28;
    const pillX = pageWidth - margin - pillWidth;
    doc.setFillColor(254, 226, 226); // Rose 100
    doc.roundedRect(pillX, 21.5, pillWidth, 6.8, 1.8, 1.8, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.setLineWidth(0.3);
    doc.roundedRect(pillX, 21.5, pillWidth, 6.8, 1.8, 1.8, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(225, 29, 72); // Rose 600
    doc.text('REJECTED', pillX + pillWidth / 2, 26, { align: 'center' });
  }

  // 4. Horizontal Separator
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(margin, 31, pageWidth - margin, 31);

  // 5. Metadata Bar (4-Column Info Grid, perfectly aligned)
  const metaBarY = 35;
  const metaBarHeight = 15;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, metaBarY, contentWidth, metaBarHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, metaBarY, contentWidth, metaBarHeight, 2, 2, 'D');

  const colWidth = contentWidth / 4; // 44.5mm each

  // Subtle vertical dividing lines between columns
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin + colWidth, metaBarY + 2.5, margin + colWidth, metaBarY + metaBarHeight - 2.5);
  doc.line(margin + colWidth * 2, metaBarY + 2.5, margin + colWidth * 2, metaBarY + metaBarHeight - 2.5);
  doc.line(margin + colWidth * 3, metaBarY + 2.5, margin + colWidth * 3, metaBarY + metaBarHeight - 2.5);

  // Meta Col 1: Invoice Number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('INVOICE NUMBER', margin + 4.5, metaBarY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.id, margin + 4.5, metaBarY + 11);

  // Meta Col 2: Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('DATE OF ISSUE', margin + colWidth + 4.5, metaBarY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.date, margin + colWidth + 4.5, metaBarY + 11);

  // Meta Col 3: Payment Method
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT CHANNEL', margin + colWidth * 2 + 4.5, metaBarY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const paymentChannelName = invoice.paymentMethod === 'upi' ? 'UPI Instant Pay' : 'PayPal Gateway';
  doc.text(paymentChannelName, margin + colWidth * 2 + 4.5, metaBarY + 11);

  // Meta Col 4: Reference / UTR ID
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('REFERENCE / UTR ID', margin + colWidth * 3 + 4.5, metaBarY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const refText = invoice.paymentRef.length > 16 ? invoice.paymentRef.substring(0, 16) + '...' : invoice.paymentRef;
  doc.text(refText, margin + colWidth * 3 + 4.5, metaBarY + 11);

  // 6. Two-Column Billing Parties Card (Subscriber & Merchant)
  const billBoxY = 54;
  const billBoxHeight = 33;
  const halfBoxWidth = (contentWidth - 6) / 2; // 86mm

  // Box 1: Billed To (Customer)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, billBoxY, halfBoxWidth, billBoxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, billBoxY, halfBoxWidth, billBoxHeight, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text('BILLED TO (SUBSCRIBER)', margin + 4.5, billBoxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientName || 'Valued Subscriber', margin + 4.5, billBoxY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let billLineY = billBoxY + 17;
  if (invoice.companyName) {
    doc.text(`Organization: ${invoice.companyName}`, margin + 4.5, billLineY);
    billLineY += 4.5;
  }
  doc.text(`Email: ${invoice.clientEmail}`, margin + 4.5, billLineY);
  billLineY += 4.5;
  if (invoice.billingAddress) {
    doc.text(`Location: ${invoice.billingAddress}`, margin + 4.5, billLineY);
  }

  // Box 2: Merchant / Service Provider
  const merchantBoxX = margin + halfBoxWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(merchantBoxX, billBoxY, halfBoxWidth, billBoxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(merchantBoxX, billBoxY, halfBoxWidth, billBoxHeight, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUED BY (MERCHANT)', merchantBoxX + 4.5, billBoxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ActionScribe AI Operations', merchantBoxX + 4.5, billBoxY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Receiver: Vikas Verma', merchantBoxX + 4.5, billBoxY + 17);
  doc.text('Payee Email: vikasverm48472@gmail.com', merchantBoxX + 4.5, billBoxY + 21.5);
  const vpaOrGateway = invoice.paymentMethod === 'upi' ? 'Merchant VPA: 9711040665@ptsbi (SBI)' : 'Gateway: PayPal Official Merchant Account';
  doc.text(vpaOrGateway, merchantBoxX + 4.5, billBoxY + 26);

  // 7. Line Items Table Header
  const tableY = 91;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(margin, tableY, contentWidth, 8, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // Slate 600

  doc.text('ITEM DESCRIPTION', margin + 5, tableY + 5.5);
  doc.text('BILLING CYCLE', margin + 90, tableY + 5.5);
  doc.text('QTY', margin + 128, tableY + 5.5, { align: 'center' });
  doc.text('UNIT RATE', margin + 152, tableY + 5.5, { align: 'right' });
  doc.text('NET AMOUNT', margin + contentWidth - 5, tableY + 5.5, { align: 'right' });

  // 8. Line Item Content Row
  const rowY = tableY + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`ActionScribe ${invoice.planName} Plan`, margin + 5, rowY);

  // Plan features breakdown under item name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const planDetails = invoice.planId === 'team'
    ? 'Unlimited monthly meetings (180 min), Multi-user Team Workspace, CRM & Notion 1-Click Export, Priority AI'
    : invoice.planId === 'starter'
    ? '15 meetings / month (30 min max), Candidate Rubrics, Notion Export, Executive Meeting Recaps'
    : '40 meetings / month (60 min max), Notion & Slack Export, Candidate Rubric, Fast Audio Intelligence';
  doc.text(planDetails, margin + 5, rowY + 4.5);

  // Cycle & Qty
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const cycleText = invoice.billingCycle === 'annual' ? 'Annual (12 Mos)' : 'Monthly Recurring';
  doc.text(cycleText, margin + 90, rowY + 1);
  doc.text('1', margin + 128, rowY + 1, { align: 'center' });

  // Prices
  const formattedPrice = invoice.paymentMethod === 'upi'
    ? `INR ${invoice.amountINR.toLocaleString('en-IN')}.00`
    : `USD $${invoice.amountUSD.toFixed(2)}`;

  doc.text(formattedPrice, margin + 152, rowY + 1, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(formattedPrice, margin + contentWidth - 5, rowY + 1, { align: 'right' });

  // Subtle separator line under item
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.4);
  doc.line(margin, rowY + 9, pageWidth - margin, rowY + 9);

  // 9. Financial Summary Table (Right Aligned, Explicit Spacing)
  const summaryStartY = rowY + 16;
  const labelColX = margin + 95;
  const valueColX = margin + contentWidth - 5;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', labelColX, summaryStartY);
  doc.setTextColor(15, 23, 42);
  doc.text(formattedPrice, valueColX, summaryStartY, { align: 'right' });

  // Taxes (GST / VAT)
  doc.setTextColor(100, 116, 139);
  doc.text('Taxes & Surcharges (GST / VAT):', labelColX, summaryStartY + 5.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentMethod === 'upi' ? 'INR 0.00' : 'USD $0.00', valueColX, summaryStartY + 5.5, { align: 'right' });

  // Gateway Processing Fee
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Gateway Surcharge:', labelColX, summaryStartY + 11);
  doc.setTextColor(15, 23, 42);
  doc.text('Waived (0.00)', valueColX, summaryStartY + 11, { align: 'right' });

  // Grand Total Paid Highlight Box
  const totalBoxY = summaryStartY + 16;
  const totalBoxWidth = (margin + contentWidth) - (labelColX - 4);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(labelColX - 4, totalBoxY, totalBoxWidth, 10.5, 2, 2, 'F');
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.roundedRect(labelColX - 4, totalBoxY, totalBoxWidth, 10.5, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(79, 70, 229);
  doc.text(isPaid ? 'Total Paid:' : 'Total Payable:', labelColX, totalBoxY + 7);
  doc.setFontSize(10.5);
  doc.text(formattedPrice, valueColX, totalBoxY + 7, { align: 'right' });

  // 10. Official Payment Settlement Audit Box
  const auditBoxY = totalBoxY + 16;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, auditBoxY, contentWidth, 35, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, auditBoxY, contentWidth, 35, 2, 2, 'D');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT SETTLEMENT RECEIPT & BANK VERIFICATION RECORD', margin + 5, auditBoxY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  if (invoice.paymentMethod === 'upi') {
    doc.text('Payment Gateway:', margin + 5, auditBoxY + 13);
    doc.setFont('helvetica', 'bold');
    doc.text('UPI Direct Transfer (NPCI Network / State Bank of India)', margin + 45, auditBoxY + 13);

    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiary UPI VPA:', margin + 5, auditBoxY + 18.5);
    doc.setFont('helvetica', 'bold');
    doc.text('9711040665@ptsbi (Receiver: Vikas Verma)', margin + 45, auditBoxY + 18.5);

    doc.setFont('helvetica', 'normal');
    doc.text('Bank Reference / UTR:', margin + 5, auditBoxY + 24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.paymentRef || 'N/A', margin + 45, auditBoxY + 24);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Settlement Status:', margin + 5, auditBoxY + 29.5);
    doc.setFont('helvetica', 'bold');
    if (isPaid) {
      doc.setTextColor(5, 150, 105);
      doc.text('Verified & Credited — Full Plan Access Active', margin + 45, auditBoxY + 29.5);
    } else if (isPending) {
      doc.setTextColor(180, 83, 9);
      doc.text('Pending Merchant Bank Reconciliation against 9711040665@ptsbi', margin + 45, auditBoxY + 29.5);
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text('Payment Failed / UTR Unverified', margin + 45, auditBoxY + 29.5);
    }
  } else {
    doc.text('Payment Processor:', margin + 5, auditBoxY + 13);
    doc.setFont('helvetica', 'bold');
    doc.text('PayPal Inc. / Official Digital Wallet Gateway', margin + 45, auditBoxY + 13);

    doc.setFont('helvetica', 'normal');
    doc.text('Merchant Receiver:', margin + 5, auditBoxY + 18.5);
    doc.setFont('helvetica', 'bold');
    doc.text('vikasverm48472@gmail.com', margin + 45, auditBoxY + 18.5);

    doc.setFont('helvetica', 'normal');
    doc.text('PayPal Order / Txn ID:', margin + 5, auditBoxY + 24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.paymentRef || 'TXN-CAPTURED', margin + 45, auditBoxY + 24);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Settlement Status:', margin + 5, auditBoxY + 29.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('Captured & Authorized via PayPal Secure Checkout', margin + 45, auditBoxY + 29.5);
  }

  // 11. Legal & Regulatory Footer
  const footerY = 274;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('This document is a certified computer-generated tax invoice. No physical signature is required.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('ActionScribe AI — Automated Intelligent Recaps & Meeting Intelligence Platform.', pageWidth / 2, footerY + 4, { align: 'center' });
  doc.text('For billing inquiries or enterprise support: vikasverm48472@gmail.com | https://actionscribe.ai', pageWidth / 2, footerY + 8, { align: 'center' });

  // Save the PDF
  doc.save(`ActionScribe_Tax_Invoice_${invoice.id}.pdf`);
}
