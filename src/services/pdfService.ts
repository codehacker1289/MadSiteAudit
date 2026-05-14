import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AuditReport } from "./auditService";

export async function exportToPDF(elementId: string, report: AuditReport) {
  const input = document.getElementById(elementId);
  if (!input) return;

  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`audit-report-${report.url.replace(/[^a-z0-9]/gi, "-")}.pdf`);
}
