import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AuditReport } from "./auditService";

export async function exportToPDF(elementId: string, report: AuditReport) {
  try {
    const input = document.getElementById(elementId);
    if (!input) {
      console.error("PDF Export Error: Element target not found", elementId);
      return;
    }

    // Capture with specific settings to handle dark/light mode and dynamic content
    const canvas = await html2canvas(input, {
      scale: 1.5, // Slightly lower scale for better compatibility/memory
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: getComputedStyle(input).backgroundColor || '#ffffff',
      onclone: (clonedDoc) => {
        // Ensure the cloned element is visible and has correct dimensions
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.padding = '20px';
          clonedElement.style.width = '1200px'; // Fixed width for consistent export
        }
      }
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
      hotfixes: ["px_scaling"],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height, undefined, 'FAST');
    pdf.save(`audit-report-${report.url.replace(/[^a-z0-9]/gi, "-").slice(0, 30)}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
  }
}
