import { jsPDF } from "jspdf";
import { AuditReport } from "./auditService";

/**
 * Professional PDF Generation System
 * Uses structured drawing instead of brittle screenshots
 */
export async function exportToPDF(_elementId: string, report: AuditReport) {
  try {
    if (!report || !report.categories) {
      throw new Error("Invalid report data for PDF generation");
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 20;

    // --- HELPER: Colors ---
    const colors = {
      primary: [239, 68, 68], // Red-500
      secondary: [30, 41, 59], // Slate-800
      text: [31, 41, 55], // Gray-800
      muted: [107, 114, 128], // Gray-500
      success: [16, 185, 129], // Emerald-500
      warning: [245, 158, 11], // Amber-500
      info: [59, 130, 246], // Blue-500
      light: [249, 250, 251], // Gray-50
      border: [229, 231, 235], // Gray-200
    };

    const checkPageBreak = (neededHeight: number) => {
      if (cursorY + neededHeight > pageHeight - 20) {
        doc.addPage();
        cursorY = 20;
        return true;
      }
      return false;
    };

    // --- HEADER ---
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.roundedRect(margin, cursorY, 8, 8, 1, 1, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("Madrocket", margin + 12, cursorY + 6);
    
    doc.setFontSize(10);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text("STRATEGIC DIGITAL AUDIT", margin + 45, cursorY + 6);

    const dateStr = new Date(report.timestamp).toLocaleDateString();
    const timeStr = new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(`AGENT: ${report.generatedBy.toUpperCase()}`, pageWidth - margin - 50, cursorY + 4);
    doc.text(`DATE: ${dateStr} @ ${timeStr}`, pageWidth - margin - 50, cursorY + 8);

    cursorY += 15;
    
    // --- TOP BANNER (URL & SCORE) ---
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 25, 2, 2, "F");
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 25, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(report.url, margin + 5, cursorY + 11);
    
    doc.setFontSize(8);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(report.businessDomain?.toUpperCase() || "WEB DOMAIN", margin + 5, cursorY + 18);

    // Score Circle in Banner
    const scoreColor = report.overallScore >= 90 ? colors.success : report.overallScore >= 70 ? colors.info : colors.primary;
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.circle(pageWidth - margin - 15, cursorY + 12.5, 9, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    const scoreText = report.overallScore.toString();
    const textWidth = doc.getTextWidth(scoreText);
    doc.text(scoreText, pageWidth - margin - 15 - textWidth / 2, cursorY + 14);
    
    doc.setFontSize(6);
    doc.text("SCORE", pageWidth - margin - 15 - doc.getTextWidth("SCORE") / 2, cursorY + 17);

    cursorY += 32;

    // --- PROFOUND INSIGHTS (Psych + Vision) ---
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("EXECUTIVE INTELLIGENCE", margin, cursorY);
    cursorY += 5;

    const columnWidth = (contentWidth / 2) - 2;
    
    // Psych Impact
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(margin, cursorY, columnWidth, 22, 1, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("PSYCHOLOGICAL IMPRESSION", margin + 3, cursorY + 5);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont("helvetica", "italic");
    const psychLines = doc.splitTextToSize(report.psychologicalImpact, columnWidth - 6);
    doc.text(psychLines, margin + 3, cursorY + 10);

    // Strategic Vision
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(margin + columnWidth + 4, cursorY, columnWidth, 22, 1, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(colors.info[0], colors.info[1], colors.info[2]);
    doc.text("STRATEGIC VISION", margin + columnWidth + 7, cursorY + 5);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont("helvetica", "normal");
    const visionLines = doc.splitTextToSize(report.strategicVision, columnWidth - 6);
    doc.text(visionLines, margin + columnWidth + 7, cursorY + 10);

    cursorY += 30;

    // --- METRIC BREAKDOWN ---
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("CORE METRICS", margin, cursorY);
    cursorY += 5;

    const categories = [
      { name: "Vital Signs", score: report.categories.vitalSigns.score },
      { name: "Prestige", score: report.categories.prestigeFactor.score },
      { name: "Comm Health", score: report.categories.communicationHealth.score },
      { name: "Ops Friction", score: report.categories.operationalFriction.score },
      { name: "Compliance", score: report.categories.communityCompliance.score },
    ];

    const cardSpacer = (contentWidth - 8) / 5;
    categories.forEach((cat, i) => {
      const x = margin + i * (cardSpacer + 2);
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.roundedRect(x, cursorY, cardSpacer, 14, 1, 1, "F");
      
      doc.setFontSize(6);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text(cat.name.toUpperCase(), x + 2, cursorY + 5);

      doc.setFontSize(9);
      const cScoreColor = cat.score >= 90 ? colors.success : cat.score >= 70 ? colors.info : colors.primary;
      doc.setTextColor(cScoreColor[0], cScoreColor[1], cScoreColor[2]);
      doc.text(cat.score.toString(), x + 2, cursorY + 11);
    });

    cursorY += 22;

    // --- INDUSTRY & FUNNEL ---
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("COMMERCIAL BENCHMARKING", margin, cursorY);
    cursorY += 5;

    // Industry Benchmark Box
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(margin, cursorY, columnWidth, 30, 1, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("INDUSTRY PERFORMANCE", margin + 3, cursorY + 5);
    
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(`${report.industryBenchmark.score}%`, margin + 3, cursorY + 11);
    
    doc.setFontSize(6.5);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const benchmarkLines = doc.splitTextToSize(report.industryBenchmark.description, columnWidth - 6);
    doc.text(benchmarkLines, margin + 3, cursorY + 15);

    // Conversion leaks
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(margin + columnWidth + 4, cursorY, columnWidth, 30, 1, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.text("CONVERSION FUNNEL (LEAKS)", margin + columnWidth + 7, cursorY + 5);
    
    doc.setFontSize(6);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    let leakY = cursorY + 11;
    report.conversionFunnel.leaks.slice(0, 4).forEach(leak => {
       doc.text(`! ${leak.toUpperCase()}`, margin + columnWidth + 7, leakY);
       leakY += 4;
    });

    cursorY += 35;

    // --- SWOT MATRIX ---
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("SWOT ANALYSIS", margin, cursorY);
    cursorY += 5;

    const swotWidth = contentWidth / 4;
    const swotColors = [colors.success, colors.primary, colors.info, colors.warning];
    const swotLabels = ["STRENGTHS", "WEAKNESSES", "OPPORTUNITIES", "THREATS"];
    const swotKeys = ["strengths", "weaknesses", "opportunities", "threats"] as const;

    swotKeys.forEach((key, i) => {
      const x = margin + i * swotWidth;
      const color = swotColors[i];
      doc.setFillColor(color[0], color[1], color[2], 0.05);
      doc.rect(x, cursorY, swotWidth, 40, "F");
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.line(x, cursorY, x + swotWidth, cursorY);
      
      doc.setFontSize(7);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(swotLabels[i], x + 2, cursorY + 5);

      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setFontSize(5.5);
      let itemY = cursorY + 10;
      report.swotAnalysis[key].forEach((item) => {
        const itemLines = doc.splitTextToSize(`• ${item}`, swotWidth - 4);
        doc.text(itemLines, x + 2, itemY);
        itemY += itemLines.length * 3.5;
      });
    });

    cursorY += 50;

    // --- REMEDIATION PLAN ---
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("12-MONTH STRATEGIC ROADMAP", margin, cursorY);
    cursorY += 8;

    const phaseWidth = (contentWidth - 10) / 3;
    report.remediationPlan.forEach((phase, i) => {
       const x = margin + i * (phaseWidth + 5);
       doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
       doc.roundedRect(x, cursorY, phaseWidth, 6, 1, 1, "F");
       doc.setTextColor(255, 255, 255);
       doc.setFontSize(7);
       doc.text(phase.phase.toUpperCase(), x + 2, cursorY + 4);
       
       doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
       doc.setFontSize(6.5);
       let taskY = cursorY + 11;
       phase.tasks.forEach((task) => {
         const tLines = doc.splitTextToSize(`- ${task}`, phaseWidth - 4);
         doc.text(tLines, x, taskY);
         taskY += tLines.length * 3.5;
       });
    });

    cursorY += 45;

    // --- DETAILED FINDINGS ---
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("COMPREHENSIVE AUDIT LOG", margin, cursorY);
    cursorY += 8;

    const allFindings = Object.entries(report.categories).flatMap(([_, cat]) => cat.points);
    
    for (const point of allFindings) {
      // Calculate needed height for this finding
      const titleLines = doc.splitTextToSize(point.title || "Untitled Finding", contentWidth - 25);
      const descLines = doc.splitTextToSize(point.description || "", contentWidth - 10);
      const whyLines = doc.splitTextToSize(point.whyItMatters || "", contentWidth - 20);
      const fixLines = doc.splitTextToSize(point.fixStrategy || "", contentWidth - 20);

      const findingHeight = 8 + (titleLines.length * 4) + (descLines.length * 4) + (whyLines.length * 4) + (fixLines.length * 4) + 20;
      
      checkPageBreak(findingHeight);

      // Status indicator
      const impactColor = point.impact === 'high' ? colors.primary : point.impact === 'medium' ? colors.warning : colors.info;
      doc.setFillColor(impactColor[0], impactColor[1], impactColor[2], 0.1);
      doc.roundedRect(margin, cursorY, contentWidth, findingHeight - 5, 2, 2, "F");
      
      // Impact tag
      doc.setFillColor(impactColor[0], impactColor[1], impactColor[2]);
      doc.roundedRect(margin + 2, cursorY + 2, 18, 4, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5.5);
      doc.text(point.impact.toUpperCase(), margin + 11 - doc.getTextWidth(point.impact.toUpperCase()) / 2, cursorY + 4.8);

      // Title
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(titleLines, margin + 22, cursorY + 5);
      
      cursorY += (titleLines.length * 4.5) + 4;

      // Location
      doc.setFontSize(6);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text(`LOCATION: ${(point.location || "NOT SPECIFIED").toUpperCase()}`, margin + 5, cursorY);
      cursorY += 4;

      // Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(descLines, margin + 5, cursorY);
      cursorY += (descLines.length * 4.5);

      // Why it matters
      doc.setFillColor(255, 255, 255, 0.5);
      const whyBoxHeight = (whyLines.length * 4) + 8;
      doc.roundedRect(margin + 5, cursorY, contentWidth - 10, whyBoxHeight, 1, 1, "F");
      doc.setFontSize(6.5);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFont("helvetica", "bold");
      doc.text("COMMERCIAL IMPACT:", margin + 7, cursorY + 4);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text(whyLines, margin + 7, cursorY + 8);
      cursorY += whyBoxHeight + 4;

      // Fix Strategy
      doc.setFontSize(6.5);
      doc.setTextColor(colors.info[0], colors.info[1], colors.info[2]);
      doc.setFont("helvetica", "bold");
      doc.text("TECHNICAL REMEDIATION:", margin + 7, cursorY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(fixLines, margin + 7, cursorY + 4);
      
      cursorY += (fixLines.length * 4.5) + 16;
    }

    // FOOTER
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer Line
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        doc.line(margin, 285, pageWidth - margin, 285);

        doc.setFontSize(6);
        doc.setTextColor(180, 180, 180);
        doc.text(`CONFIDENTIAL INTEL - MADROCKET NEURAL AUDIT - PAGE ${i} OF ${totalPages}`, pageWidth / 2, 290, { align: 'center' });
        
        doc.setFontSize(5);
        doc.text("VERIFIED BY MADROCKET CORE ENGINE v4.2.1", margin, 290);
        doc.text(new Date().toISOString(), pageWidth - margin - doc.getTextWidth(new Date().toISOString()), 290);
    }

    doc.save(`audit-report-${report.url.replace(/[^a-z0-9]/gi, "-").slice(0, 30)}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
    throw error;
  }
}
