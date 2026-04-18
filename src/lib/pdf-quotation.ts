import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CURRENCY_SYMBOL,
  formatCurrency,
  type AdditionalServices,
  type Currency,
  DEFAULT_INCLUSIONS,
  DEFAULT_EXCLUSIONS,
} from "./pricing";

export interface QuotationData {
  clientName: string;
  pax: number;
  hotelMakkah: string;
  hotelMadinah: string;
  quad: number;
  triple: number;
  double: number;
  additional: AdditionalServices;
  currency: Currency;
  fxRate: number;
  notes?: string;
  inclusions?: string[];
  exclusions?: string[];
}

const GOLD: [number, number, number] = [212, 152, 60];
const DARK: [number, number, number] = [40, 32, 22];

export function generateQuotationPdf(q: QuotationData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header band
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 30, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 30, pageW, 1.5, "F");

  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("IGH TOUR", margin, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 200, 160);
  doc.text("PREMIUM UMRAH · BINTANG 5", margin, 22);
  doc.text(
    "Pilihanmu untuk menjelajah Timur Tengah",
    margin,
    26,
  );

  doc.setTextColor(...GOLD);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageW - margin, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 200, 160);
  doc.text(
    `Date: ${new Date().toLocaleDateString("id-ID")}`,
    pageW - margin,
    22,
    { align: "right" },
  );
  doc.text(`Ref: IGH-${Date.now().toString().slice(-6)}`, pageW - margin, 26, {
    align: "right",
  });

  // Client info
  let y = 42;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("KEPADA YTH:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(q.clientName, margin, y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("DETAIL GROUP:", pageW / 2 + 10, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.text(`Jumlah PAX  : ${q.pax} orang`, pageW / 2 + 10, y + 6);
  doc.text(`Currency    : ${q.currency}`, pageW / 2 + 10, y + 11);

  // Package summary
  y = 65;
  doc.setFillColor(245, 240, 225);
  doc.rect(margin, y, pageW - margin * 2, 20, "F");
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PAKET LAND ARRANGEMENT (LA) — UMRAH PREMIUM", margin + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Hotel Makkah  : ${q.hotelMakkah || "-"}`, margin + 4, y + 13);
  doc.text(`Hotel Madinah : ${q.hotelMadinah || "-"}`, margin + 4, y + 18);

  // Pricing table
  y = 92;
  const sym = CURRENCY_SYMBOL[q.currency];
  const fmt = (v: number) => formatCurrency(v, q.currency, q.fxRate);

  const addPerPax =
    q.additional.visa +
    q.additional.muthowif +
    q.additional.siskopatuh +
    q.additional.handling;

  autoTable(doc, {
    startY: y,
    head: [["Tipe Kamar", `Harga LA / pax (${sym})`, "Add. Services / pax", "Total / pax", `Total (${q.pax} PAX)`]],
    body: [
      ["Quad Sharing", fmt(q.quad), fmt(addPerPax), fmt(q.quad + addPerPax), fmt((q.quad + addPerPax) * q.pax)],
      ["Triple Sharing", fmt(q.triple), fmt(addPerPax), fmt(q.triple + addPerPax), fmt((q.triple + addPerPax) * q.pax)],
      ["Double Sharing", fmt(q.double), fmt(addPerPax), fmt(q.double + addPerPax), fmt((q.double + addPerPax) * q.pax)],
    ],
    theme: "grid",
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [40, 32, 22] },
    alternateRowStyles: { fillColor: [250, 247, 240] },
    margin: { left: margin, right: margin },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 8;

  // Additional services breakdown
  if (addPerPax > 0) {
    autoTable(doc, {
      startY: finalY,
      head: [["Additional Service", `Harga / pax (${sym})`]],
      body: [
        ["Visa Umroh", fmt(q.additional.visa)],
        ["Muthowif/Muthowifah", fmt(q.additional.muthowif)],
        ["Siskopatuh", fmt(q.additional.siskopatuh)],
        ["Handling", fmt(q.additional.handling)],
      ].filter((row) => {
        // Show all rows
        return true;
      }),
      theme: "striped",
      headStyles: { fillColor: GOLD, textColor: DARK, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Inclusions & Exclusions
  const inc = q.inclusions ?? DEFAULT_INCLUSIONS;
  const exc = q.exclusions ?? DEFAULT_EXCLUSIONS;

  const colW = (pageW - margin * 2 - 6) / 2;
  doc.setFillColor(...DARK);
  doc.rect(margin, finalY, colW, 7, "F");
  doc.rect(margin + colW + 6, finalY, colW, 7, "F");
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("INCLUSIONS", margin + 3, finalY + 5);
  doc.text("EXCLUSIONS", margin + colW + 9, finalY + 5);

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  let yi = finalY + 12;
  inc.forEach((item) => {
    const lines = doc.splitTextToSize("✓ " + item, colW - 4);
    doc.text(lines, margin + 2, yi);
    yi += lines.length * 4 + 1;
  });
  let ye = finalY + 12;
  exc.forEach((item) => {
    const lines = doc.splitTextToSize("✗ " + item, colW - 4);
    doc.text(lines, margin + colW + 8, ye);
    ye += lines.length * 4 + 1;
  });

  // Footer
  const footY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(...DARK);
  doc.rect(0, footY, pageW, 20, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, footY, pageW, 1, "F");
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("IGH TOUR", margin, footY + 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 200, 160);
  doc.setFontSize(7);
  doc.text(
    "Quotation ini berlaku selama 14 hari sejak tanggal terbit.",
    margin,
    footY + 13,
  );
  doc.text(
    "Harga dapat berubah sesuai ketersediaan kamar & fluktuasi kurs.",
    margin,
    footY + 17,
  );
  doc.text(
    "Operational mulai Juli 2026",
    pageW - margin,
    footY + 13,
    { align: "right" },
  );

  return doc;
}
