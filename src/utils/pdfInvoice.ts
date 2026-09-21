import { jsPDF } from 'jspdf';
import { InvoiceRecord } from '../types';

export function generateInvoicePDF(invoice: InvoiceRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2; // 178mm

  // 1. Top Decorative Executive Accent Bar (Dual Tone)
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 4, 'F');
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 4, 80, 2, 'F');

  // 2. Company Brand Logo & Header
  // Brand Icon Box
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, 14, 11, 11, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('A', margin + 3.2, 22);

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('ActionScribe AI', margin + 14, 21);

  // Brand Subtitle & Merchant Contact
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Enterprise Meeting Intelligence & Workspace Recaps', margin + 14, 26);
  doc.text('Merchant Contact: vikasverm48472@gmail.com | https://actionscribe.ai', margin + 14, 30);

  // 3. Document Title & Status Pill (Right Aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('TAX INVOICE', pageWidth - margin, 20, { align: 'right' });

  // Status Badge Pill
  const isPaid = invoice.status === 'paid';
  const isPending = invoice.status === 'pending_verification';

  if (isPaid) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.roundedRect(pageWidth - margin - 36, 23.5, 36, 7.5, 2, 2, 'F');
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(pageWidth - margin - 36, 23.5, 36, 7.5, 2, 2, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text('PAID & ACTIVE', pageWidth - margin - 18, 28.5, { align: 'center' });
  } else if (isPending) {
    doc.setFillColor(254, 243, 199); // Amber 50
    doc.roundedRect(pageWidth - margin - 48, 23.5, 48, 7.5, 2, 2, 'F');
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.roundedRect(pageWidth - margin - 48, 23.5, 48, 7.5, 2, 2, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text('PENDING VERIFICATION', pageWidth - margin - 24, 28.5, { align: 'center' });
  } else {
    doc.setFillColor(254, 226, 226); // Rose 100
    doc.roundedRect(pageWidth - margin - 32, 23.5, 32, 7.5, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(225, 29, 72); // Rose 600
    doc.text('REJECTED', pageWidth - margin - 16, 28.5, { align: 'center' });
  }

  // 4. Horizontal Separator
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(margin, 36, pageWidth - margin, 36);

  // 5. Metadata Bar (4-Column Info Grid)
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, 40, contentWidth, 16, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 40, contentWidth, 16, 2, 2, 'D');

  const colWidth = contentWidth / 4;

  // Meta Col 1: Invoice Number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('INVOICE NUMBER', margin + 4, 45.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.id, margin + 4, 51.5);

  // Meta Col 2: Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DATE OF ISSUE', margin + colWidth + 4, 45.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.date, margin + colWidth + 4, 51.5);

  // Meta Col 3: Payment Method
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT CHANNEL', margin + colWidth * 2 + 4, 45.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const paymentChannelName = invoice.paymentMethod === 'upi' ? 'UPI Instant Pay' : 'PayPal Gateway';
  doc.text(paymentChannelName, margin + colWidth * 2 + 4, 51.5);

  // Meta Col 4: Reference / UTR ID
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('REFERENCE / UTR ID', margin + colWidth * 3 + 4, 45.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const refText = invoice.paymentRef.length > 15 ? invoice.paymentRef.substring(0, 15) + '...' : invoice.paymentRef;
  doc.text(refText, margin + colWidth * 3 + 4, 51.5);

  // 6. Two-Column Billing Parties Card
  const billBoxY = 61;
  const halfBoxWidth = (contentWidth - 6) / 2;

  // Box 1: Billed To (Customer)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, billBoxY, halfBoxWidth, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, billBoxY, halfBoxWidth, 32, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.text('BILLED TO (SUBSCRIBER)', margin + 4, billBoxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientName || 'Valued Subscriber', margin + 4, billBoxY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let billLineY = billBoxY + 17;
  if (invoice.companyName) {
    doc.text(`Organization: ${invoice.companyName}`, margin + 4, billLineY);
    billLineY += 4.5;
  }
  doc.text(`Email: ${invoice.clientEmail}`, margin + 4, billLineY);
  billLineY += 4.5;
  if (invoice.billingAddress) {
    doc.text(`Location: ${invoice.billingAddress}`, margin + 4, billLineY);
  }

  // Box 2: Merchant / Service Provider
  const merchantBoxX = margin + halfBoxWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(merchantBoxX, billBoxY, halfBoxWidth, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(merchantBoxX, billBoxY, halfBoxWidth, 32, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUED BY (MERCHANT)', merchantBoxX + 4, billBoxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ActionScribe AI Operations', merchantBoxX + 4, billBoxY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Receiver: Vikas Verma', merchantBoxX + 4, billBoxY + 17);
  doc.text('Payee Email: vikasverm48472@gmail.com', merchantBoxX + 4, billBoxY + 21.5);
  doc.text('Merchant VPA: 9711040665@ptsbi (SBI)', merchantBoxX + 4, billBoxY + 26);

  // 7. Line Items Table Header
  const tableY = 98;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(margin, tableY, contentWidth, 9, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate 600

  doc.text('ITEM DESCRIPTION', margin + 5, tableY + 6);
  doc.text('BILLING CYCLE', margin + 96, tableY + 6);
  doc.text('QTY', margin + 130, tableY + 6, { align: 'center' });
  doc.text('UNIT RATE', margin + 152, tableY + 6, { align: 'right' });
  doc.text('NET AMOUNT', margin + contentWidth - 4, tableY + 6, { align: 'right' });

  // 8. Line Item Content Row
  const rowY = tableY + 15;
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
  doc.text(cycleText, margin + 96, rowY + 1);
  doc.text('1', margin + 130, rowY + 1, { align: 'center' });

  // Prices
  const formattedPrice = invoice.paymentMethod === 'upi'
    ? `INR ${invoice.amountINR.toLocaleString('en-IN')}.00`
    : `USD $${invoice.amountUSD.toFixed(2)}`;

  doc.text(formattedPrice, margin + 152, rowY + 1, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(formattedPrice, margin + contentWidth - 4, rowY + 1, { align: 'right' });

  // Subtle separator line under item
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.4);
  doc.line(margin, rowY + 9, pageWidth - margin, rowY + 9);

  // 9. Financial Summary Table (Right Aligned, Explicit Spacing)
  const summaryStartY = rowY + 16;
  const labelColX = margin + 100;
  const valueColX = margin + contentWidth - 4;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', labelColX, summaryStartY);
  doc.setTextColor(15, 23, 42);
  doc.text(formattedPrice, valueColX, summaryStartY, { align: 'right' });

  // Taxes (GST / VAT) - Fixes previous overlapping bug!
  doc.setTextColor(100, 116, 139);
  doc.text('Taxes & Surcharges (GST / VAT):', labelColX, summaryStartY + 6);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentMethod === 'upi' ? 'INR 0.00' : 'USD $0.00', valueColX, summaryStartY + 6, { align: 'right' });

  // Gateway Fee
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Gateway Surcharge:', labelColX, summaryStartY + 12);
  doc.setTextColor(15, 23, 42);
  doc.text('Waived (0.00)', valueColX, summaryStartY + 12, { align: 'right' });

  // Grand Total Paid Highlight Box
  const totalBoxY = summaryStartY + 17;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(labelColX - 4, totalBoxY, (contentWidth - 100) + 4, 11, 2, 2, 'F');
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.6);
  doc.roundedRect(labelColX - 4, totalBoxY, (contentWidth - 100) + 4, 11, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text(isPaid ? 'Total Paid:' : 'Total Payable:', labelColX, totalBoxY + 7.5);
  doc.setFontSize(11);
  doc.text(formattedPrice, valueColX, totalBoxY + 7.5, { align: 'right' });

  // 10. Official Payment Settlement Audit Box
  const auditBoxY = totalBoxY + 18;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, auditBoxY, contentWidth, 36, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, auditBoxY, contentWidth, 36, 2, 2, 'D');

  // Title with lock icon
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT SETTLEMENT RECEIPT & BANK VERIFICATION RECORD', margin + 5, auditBoxY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  if (invoice.paymentMethod === 'upi') {
    doc.text('Payment Gateway:', margin + 5, auditBoxY + 14);
    doc.setFont('helvetica', 'bold');
    doc.text('UPI Direct Transfer (NPCI Network / State Bank of India)', margin + 45, auditBoxY + 14);

    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiary UPI VPA:', margin + 5, auditBoxY + 19.5);
    doc.setFont('helvetica', 'bold');
    doc.text('9711040665@ptsbi (Receiver: Vikas Verma)', margin + 45, auditBoxY + 19.5);

    doc.setFont('helvetica', 'normal');
    doc.text('Bank Reference / UTR:', margin + 5, auditBoxY + 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.paymentRef || 'N/A', margin + 45, auditBoxY + 25);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Settlement Status:', margin + 5, auditBoxY + 30.5);
    doc.setFont('helvetica', 'bold');
    if (isPaid) {
      doc.setTextColor(5, 150, 105);
      doc.text('Verified & Credited — Full Plan Access Active', margin + 45, auditBoxY + 30.5);
    } else if (isPending) {
      doc.setTextColor(180, 83, 9);
      doc.text('Pending Merchant Bank Reconciliation against 9711040665@ptsbi', margin + 45, auditBoxY + 30.5);
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text('Payment Failed / UTR Unverified', margin + 45, auditBoxY + 30.5);
    }
  } else {
    doc.text('Payment Processor:', margin + 5, auditBoxY + 14);
    doc.setFont('helvetica', 'bold');
    doc.text('PayPal Inc. / Official Digital Wallet Gateway', margin + 45, auditBoxY + 14);

    doc.setFont('helvetica', 'normal');
    doc.text('Merchant Receiver:', margin + 5, auditBoxY + 19.5);
    doc.setFont('helvetica', 'bold');
    doc.text('vikasverm48472@gmail.com', margin + 45, auditBoxY + 19.5);

    doc.setFont('helvetica', 'normal');
    doc.text('PayPal Order / Txn ID:', margin + 5, auditBoxY + 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.paymentRef || 'TXN-CAPTURED', margin + 45, auditBoxY + 25);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Settlement Status:', margin + 5, auditBoxY + 30.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('Captured & Authorized via PayPal Secure Checkout', margin + 45, auditBoxY + 30.5);
  }

  // 11. Legal & Regulatory Footer
  const footerY = 270;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('This document is a certified computer-generated tax invoice. No physical signature is required.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('ActionScribe AI — Automated Intelligent Recaps & Meeting Intelligence Platform.', pageWidth / 2, footerY + 4, { align: 'center' });

  // Save the PDF
  doc.save(`ActionScribe_Tax_Invoice_${invoice.id}.pdf`);
}
