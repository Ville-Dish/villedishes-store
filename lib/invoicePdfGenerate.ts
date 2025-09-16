import { formattedCurrency } from "./helper";
import { logoImageData } from "./imageData";

export const createInvoicePDF = async (data: Invoice): Promise<Uint8Array> => {
  try {
    // Import jsPDF (named export)
    const { jsPDF } = await import("jspdf");

    // Import autoTable (default export) and types
    const autoTableModule = await import("jspdf-autotable");

    const autoTable = autoTableModule.default;
    type UserOptions = Parameters<typeof autoTable>[1];

    const doc = new jsPDF({
      compress: true, // Enable PDF compression
      unit: "pt", // Use points for more precise control
      format: "a4", // Standardize on A4 format
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    let yPosition = 40;

    // Helper function to add a card-like section (optimized)
    const addCard = (
      title: string,
      content: () => void,
      width: number,
      height: number
    ) => {
      if (yPosition + height > pageHeight - 40) {
        doc.addPage();
        yPosition = 40;
      }

      doc.setDrawColor(200);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(30, yPosition, width, height, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text(title, 30 + width / 2, yPosition + 20, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(52, 73, 94);
      content();
      yPosition += height + 10;
    };

    // Helper function to add bold text
    const addBoldText = (text: string, x: number, y: number) => {
      doc.setFont("helvetica", "bold");
      doc.text(text, x, y);
      doc.setFont("helvetica", "normal");
    };

    // Add header with invoice title (optimized)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text("INVOICE", pageWidth / 2, yPosition, { align: "center" });
    doc.addImage(logoImageData, "PNG", 20, 5, 60, 60);
    yPosition += 30;

    // Bill From and Bill To cards (optimized)
    const cardWidth = (pageWidth - 90) / 2;
    doc.setDrawColor(200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(30, yPosition, cardWidth, 130, 3, 3, "FD");
    doc.roundedRect(45 + cardWidth, yPosition, cardWidth, 130, 3, 3, "FD");

    // Bill From card
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill From", 30 + cardWidth / 2, yPosition + 20, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    addBoldText("Company Name:", 40, yPosition + 50);
    doc.text("VilleDishes", 130, yPosition + 50);
    addBoldText("Company Email:", 40, yPosition + 65);
    doc.text("villedishes@gmail.com", 130, yPosition + 65);
    addBoldText("Company Phone:", 40, yPosition + 80);
    doc.text("587-984-4409", 130, yPosition + 80);
    doc.text("Pay via Interac using:", 40, yPosition + 95);
    addBoldText("villedishes@gmail.com", 160, yPosition + 95);

    // Bill To card
    doc.setFont("helvetica", "bold");
    doc.text("Bill To", 45 + cardWidth * 1.5, yPosition + 20, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    addBoldText("Customer Name:", 55 + cardWidth, yPosition + 50);
    doc.text(data.customerName, 145 + cardWidth, yPosition + 50);
    addBoldText("Customer Email:", 55 + cardWidth, yPosition + 85);
    doc.text(data.customerEmail, 145 + cardWidth, yPosition + 85);
    addBoldText("Customer Phone:", 55 + cardWidth, yPosition + 120);
    doc.text(data.customerPhone, 145 + cardWidth, yPosition + 120);

    yPosition += 140;

    // Invoice Overview (optimized)
    addCard(
      "Invoice Overview",
      () => {
        const labelX = 40;
        const valueX = 200;
        const columnWidth = (pageWidth - 100) / 2;

        addBoldText("Invoice Number:", labelX, yPosition + 40);
        doc.text(data.invoiceNumber, valueX, yPosition + 40);
        addBoldText("Date Created:", labelX, yPosition + 60);
        doc.text(data.dateCreated, valueX, yPosition + 60);
        addBoldText("Due Date:", labelX, yPosition + 80);
        doc.text(data.dueDate, valueX, yPosition + 80);
        addBoldText("Status:", labelX, yPosition + 100);
        doc.text(data.status, valueX, yPosition + 100);

        addBoldText("Amount:", labelX + columnWidth, yPosition + 40);
        doc.text(
          formattedCurrency.format(data.amount),
          valueX + columnWidth,
          yPosition + 40
        );
        addBoldText("Paid:", labelX + columnWidth, yPosition + 60);
        doc.text(
          formattedCurrency.format(data.amountPaid),
          valueX + columnWidth,
          yPosition + 60
        );
        addBoldText("Due:", labelX + columnWidth, yPosition + 80);
        doc.text(
          formattedCurrency.format(data.amountDue),
          valueX + columnWidth,
          yPosition + 80
        );
      },
      pageWidth - 60,
      120
    );

    // Product Details (optimized)
    if (data.products && data.products.length > 0) {
      const allDiscountsZero = data.products.every(
        (product) => product.discount === 0
      );
      const tableColumn = [
        "S/N",
        "Product",
        "Price ($)",
        "Qty",
        ...(allDiscountsZero ? [] : ["Discount (%)"]),
        "Total ($)",
      ];
      const tableRows = data.products.map((product, index) => [
        index + 1,
        product.name,
        product.basePrice.toFixed(2),
        product.quantity,
        ...(allDiscountsZero ? [] : [product.discount]),
        (
          product.basePrice *
          product.quantity *
          (1 - product.discount / 100)
        ).toFixed(2),
      ]);

      const tableOptions: UserOptions = {
        head: [tableColumn],
        body: tableRows,
        startY: yPosition + 20,
        theme: "grid",
        bodyStyles: { textColor: 50 },
        alternateRowStyles: { fillColor: [242, 242, 242] },
        headStyles: {
          fillColor: [245, 174, 7],
          textColor: 255,
          fontStyle: "bold",
        },
        margin: { top: 20, right: 30, bottom: 40, left: 30 },
      };

      // (doc as any).autoTable({
      autoTable(doc, tableOptions);

      // yPosition = (doc as any).autoTable.previous?.finalY
      //   ? (doc as any).autoTable.previous.finalY + 10
      //   : yPosition;
      yPosition = (doc as any).lastAutoTable?.finalY
        ? (doc as any).lastAutoTable.finalY + 10
        : yPosition + 200; // fallback
    }

    // Invoice Summary (optimized)
    // Replace the Invoice Summary section with this fixed version:
    addCard(
      "Invoice Summary",
      () => {
        // Add null checks and default values
        const products = data.products || [];
        const subtotal = products.reduce((sum, product) => {
          // Add safety checks for product properties
          const basePrice = product?.basePrice || 0;
          const quantity = product?.quantity || 0;
          const discount = product?.discount || 0;

          return sum + basePrice * quantity * (1 - discount / 100);
        }, 0);

        const discountPercentage = data.discountPercentage || 0;
        const taxRate = data.taxRate || 0;
        const shippingFee = data.shippingFee || 0;

        const discountAmount = subtotal * (discountPercentage / 100);
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal - discountAmount + taxAmount + shippingFee;

        const addSummaryRow = (
          label: string,
          value: string,
          y: number,
          isBold = false
        ) => {
          if (isBold) doc.setFont("helvetica", "bold");
          doc.text(label, 40, y);
          doc.text(value, pageWidth - 40, y, { align: "right" });
          if (isBold) doc.setFont("helvetica", "normal");
        };

        const lineHeight = 20;
        addSummaryRow("Subtotal:", `$${subtotal.toFixed(2)}`, yPosition + 40);
        addSummaryRow(
          "Discount (on subtotal):",
          `$${discountAmount.toFixed(2)}`,
          yPosition + 40 + lineHeight
        );
        addSummaryRow(
          "Tax:",
          `$${taxAmount.toFixed(2)}`,
          yPosition + 40 + lineHeight * 2
        );
        addSummaryRow(
          "Shipping Fee:",
          `$${shippingFee.toFixed(2)}`,
          yPosition + 40 + lineHeight * 3
        );
        addSummaryRow(
          "Total:",
          `$${total.toFixed(2)}`,
          yPosition + 40 + lineHeight * 4,
          true
        );
      },
      pageWidth - 60,
      140
    );

    // Footer (optimized)
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 20, {
      align: "center",
    });

    // Return optimized PDF data as Uint8Array
    const pdfOutput = doc.output("arraybuffer") as ArrayBuffer;
    return new Uint8Array(pdfOutput);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};

export const createInvoicePDFPreview = async (
  data: Invoice
): Promise<string> => {
  try {
    const pdfData = await createInvoicePDF(data);

    // ✅ Create a new Uint8Array backed by a proper ArrayBuffer
    const safePdfData = new Uint8Array(pdfData.length);
    safePdfData.set(pdfData); // Copy content byte by byte

    // Create a Blob from the Uint8Array
    const blob = new Blob([safePdfData], { type: "application/pdf" });

    // Create a data URL from the Blob
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error creating PDF preview:", error);
    throw error;
  }
};
