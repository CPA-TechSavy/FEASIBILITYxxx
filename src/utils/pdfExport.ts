import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  projectTitle?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'letter' | 'a4';
  companyName?: string;
  currency?: string;
}

/**
 * Exports an HTML element (or element ID) to a polished, professional PDF document.
 */
export async function exportElementToPdf(
  target: HTMLElement | string,
  options: PdfExportOptions
): Promise<boolean> {
  try {
    const element = typeof target === 'string' ? document.getElementById(target) : target;
    if (!element) {
      console.error(`PDF export failed: element not found (${target})`);
      return false;
    }

    // Determine orientation: if width is large (> 850px), default to landscape
    const naturalWidth = element.scrollWidth;
    const defaultOrientation = naturalWidth > 820 ? 'landscape' : 'portrait';
    const orientation = options.orientation || defaultOrientation;
    const format = options.format || 'letter';

    // Page dimensions in mm
    const isLandscape = orientation === 'landscape';
    const pageWidth = isLandscape ? 279.4 : 215.9; // Letter dimensions in mm
    const pageHeight = isLandscape ? 215.9 : 279.4;

    const marginX = 12; // 12mm horizontal margin
    const marginTop = 22; // 22mm top margin for header
    const marginBottom = 14; // 14mm bottom margin for footer
    const contentWidthMm = pageWidth - marginX * 2;
    const contentHeightMm = pageHeight - marginTop - marginBottom;

    // Clone element into an off-screen sandbox container with max-content width
    // to ensure no horizontal scroll clipping occurs regardless of screen size
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove or hide interactive and non-printable elements in the clone
    const elementsToHide = clone.querySelectorAll(
      '.no-print, .pdf-exclude, button:not(.pdf-keep), input[type="file"]'
    );
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    // Replace input/select elements with clean plain text in the clone so values render sharply
    const originalInputs = element.querySelectorAll('input, select, textarea');
    const clonedInputs = clone.querySelectorAll('input, select, textarea');
    originalInputs.forEach((orig, idx) => {
      const cloned = clonedInputs[idx];
      if (cloned) {
        const val = (orig as HTMLInputElement).value || '';
        const span = document.createElement('span');
        span.textContent = val;
        span.className = cloned.className;
        span.style.cssText = (cloned as HTMLElement).style.cssText;
        cloned.parentNode?.replaceChild(span, cloned);
      }
    });

    // Sandbox container
    const sandbox = document.createElement('div');
    sandbox.style.position = 'fixed';
    sandbox.style.left = '-99999px';
    sandbox.style.top = '0';
    sandbox.style.width = 'max-content';
    sandbox.style.minWidth = '950px';
    sandbox.style.maxWidth = '1400px';
    sandbox.style.backgroundColor = '#ffffff';
    sandbox.style.padding = '16px';
    sandbox.style.boxSizing = 'border-box';
    sandbox.style.zIndex = '-9999';
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    let canvas: HTMLCanvasElement;
    try {
      // Capture using html2canvas-pro with full oklch/color support
      canvas = await html2canvas(clone, {
        scale: 2, // 2x DPI for crisp high-res text and numbers
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: Math.max(sandbox.scrollWidth, 1200),
        ignoreElements: (el) =>
          el.classList.contains('no-print') || el.classList.contains('pdf-exclude'),
      });
    } finally {
      // Clean up sandbox
      if (sandbox.parentNode) {
        sandbox.parentNode.removeChild(sandbox);
      }
    }

    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true,
    });

    const totalCanvasWidth = canvas.width;
    const totalCanvasHeight = canvas.height;

    // Calculate how many mm high the entire content is when scaled to fit contentWidthMm
    const totalContentHeightMm = (totalCanvasHeight / totalCanvasWidth) * contentWidthMm;

    // Calculate number of pages needed
    const totalPages = Math.ceil(totalContentHeightMm / contentHeightMm) || 1;

    // Canvas height slice corresponding to one page of printable content
    const sliceCanvasHeightPx = Math.floor((contentHeightMm / contentWidthMm) * totalCanvasWidth);

    const safeProjectTitle = options.projectTitle || 'Feasibility Study';
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage(format, orientation);
      }

      // Draw top header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(30, 41, 59); // Slate 800
      pdf.text(safeProjectTitle, marginX, 10);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139); // Slate 500
      if (options.companyName) {
        pdf.text(options.companyName, marginX, 14);
      }

      // Title & Subtitle
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42); // Slate 900
      const titleText = options.title;
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, pageWidth - marginX - titleWidth, 10);

      if (options.subtitle) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        const subWidth = pdf.getTextWidth(options.subtitle);
        pdf.text(options.subtitle, pageWidth - marginX - subWidth, 14);
      }

      // Header divider line
      pdf.setDrawColor(226, 232, 240); // Slate 200
      pdf.setLineWidth(0.4);
      pdf.line(marginX, 17, pageWidth - marginX, 17);

      // Create slice of canvas for current page
      const sliceYPx = page * sliceCanvasHeightPx;
      const actualSliceHeightPx = Math.min(sliceCanvasHeightPx, totalCanvasHeight - sliceYPx);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = totalCanvasWidth;
      pageCanvas.height = actualSliceHeightPx;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sliceYPx,
          totalCanvasWidth,
          actualSliceHeightPx,
          0,
          0,
          totalCanvasWidth,
          actualSliceHeightPx
        );

        const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
        const pageImgHeightMm = (actualSliceHeightPx / totalCanvasWidth) * contentWidthMm;

        pdf.addImage(
          pageImgData,
          'PNG',
          marginX,
          marginTop,
          contentWidthMm,
          pageImgHeightMm,
          undefined,
          'FAST'
        );
      }

      // Footer divider line
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.line(marginX, pageHeight - 9, pageWidth - marginX, pageHeight - 9);

      // Draw footer
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184); // Slate 400
      pdf.text(`Generated on ${currentDate} • Feasibility Model`, marginX, pageHeight - 5);

      const pageNumText = `Page ${page + 1} of ${totalPages}`;
      const pageNumWidth = pdf.getTextWidth(pageNumText);
      pdf.text(pageNumText, pageWidth - marginX - pageNumWidth, pageHeight - 5);
    }

    // Save the PDF
    const safeFilename =
      options.filename ||
      `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
}
