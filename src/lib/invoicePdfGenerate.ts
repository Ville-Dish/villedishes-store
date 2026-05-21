import { Invoice } from "./types";
import { formattedCurrency, logoImageData } from "./utils";

export type InvoiceDisplayMode =
  | "detailed"
  | "category-summary"
  | "category-grouped";

const formatQuantity = (qty: number): string => {
  const whole = Math.floor(qty);
  const decimal = qty - whole;
  if (decimal === 0) return whole.toString();
  if (decimal === 0.5) return whole === 0 ? "½" : `${whole}½`;

  // Fallback for other decimals
  return qty.toString();
};

interface InvoiceProductWithCategory {
  id: string;
  name: string;
  basePrice: number;
  quantity: number;
  price: number;
  discount: number;
  category?: string;
}

interface CategoryGroup {
  category: string;
  products: InvoiceProductWithCategory[];
  subtotal: number;
}

export interface ColumnMappings {
  headers: {
    serialNumber?: string;
    product?: string;
    price?: string;
    quantity?: string;
    discount?: string;
    total?: string;
    category?: string;
  };
  visibility: {
    serialNumber: boolean;
    product: boolean;
    price: boolean;
    quantity: boolean;
    discount: boolean;
    total: boolean;
  };
  values: {
    products: Record<string, Record<string, string>>; // productId -> { originalName: mappedName }
    prices: Record<string, string>; // productId -> mapped price display
    quantities: Record<string, string>; // productId -> mapped quantity display (e.g., "dozen", "box")
  };
}

export const DEFAULT_COLUMN_MAPPINGS: ColumnMappings = {
  headers: {
    serialNumber: "S/N",
    product: "Product",
    price: "Price ($)",
    quantity: "Qty",
    discount: "Discount (%)",
    total: "Total ($)",
    category: "Category",
  },
  visibility: {
    serialNumber: true,
    product: true,
    price: true,
    quantity: true,
    discount: true,
    total: true,
  },
  values: { products: {}, prices: {}, quantities: {} },
};

const groupProductsByCategory = (
  products: InvoiceProductWithCategory[],
): CategoryGroup[] => {
  const categoryMap = new Map<string, InvoiceProductWithCategory[]>();
  products.forEach((product) => {
    const category = product.category || "Uncategorized";
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(product);
  });
  return Array.from(categoryMap.entries()).map(([category, products]) => ({
    category,
    products,
    subtotal: products.reduce(
      (sum, p) =>
        sum + p.basePrice * p.quantity * (1 - (p.discount || 0) / 100),
      0,
    ),
  }));
};

const getCategorySummary = (
  products: InvoiceProductWithCategory[],
): { category: string; total: number }[] => {
  const categoryTotals = new Map<string, number>();
  products.forEach((product) => {
    const category = product.category || "Uncategorized";
    const productTotal =
      product.basePrice *
      product.quantity *
      (1 - (product.discount || 0) / 100);
    categoryTotals.set(
      category,
      (categoryTotals.get(category) || 0) + productTotal,
    );
  });
  return Array.from(categoryTotals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
};

export const createInvoicePDF = async (
  data: Invoice,
  displayMode: InvoiceDisplayMode = "detailed",
  categoryMappings: Record<string, string> = {},
  columnMappings: ColumnMappings = DEFAULT_COLUMN_MAPPINGS,
): Promise<Uint8Array> => {
  try {
    // Import jsPDF (named export)
    const { jsPDF } = await import("jspdf"); // Import autoTable (default export) and types

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

    let yPosition = 40; // Convert InvoiceProducts to our working format

    const products: InvoiceProductWithCategory[] = (data.products || []).map(
      (ip) => ({
        ...ip,
      }),
    ); // Helper function to add a card-like section (optimized)

    const addCard = (
      title: string,
      content: () => void,
      width: number,
      height: number,
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
    }; // Helper function to add bold text

    const addBoldText = (text: string, x: number, y: number) => {
      doc.setFont("helvetica", "bold");
      doc.text(text, x, y);
      doc.setFont("helvetica", "normal");
    }; // Helper to get display category name

    const getCategoryDisplayName = (category: string): string => {
      return categoryMappings[category] || category;
    }; // Helper to get display product name

    const getProductDisplayName = (
      productId: string,
      originalName: string,
    ): string => {
      return (
        columnMappings.values.products[productId]?.[originalName] ||
        originalName
      );
    }; // Helper to get display price

    const getPriceDisplay = (productId: string, price: number): string => {
      return columnMappings.values.prices[productId] || price.toFixed(2);
    }; // Helper to get display quantity

    const getQuantityDisplay = (
      productId: string,
      quantity: number,
    ): string => {
      const mapped = columnMappings.values.quantities[productId];
      if (mapped) {
        return mapped;
      }
      return formatQuantity(quantity);
    }; // Helper to get column header

    const getColumnHeader = (key: keyof ColumnMappings["headers"]): string => {
      return (
        columnMappings.headers[key] ||
        DEFAULT_COLUMN_MAPPINGS.headers[key] ||
        key
      );
    }; // Helper to check column visibility

    const isColumnVisible = (
      key: keyof ColumnMappings["visibility"],
    ): boolean => {
      return columnMappings.visibility[key] ?? true;
    }; // Add header with invoice title (optimized)

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text("INVOICE", pageWidth / 2, yPosition, { align: "center" });
    doc.addImage(logoImageData, "PNG", 20, 5, 60, 60);
    yPosition += 30; // Bill From and Bill To cards (optimized)

    const cardWidth = (pageWidth - 90) / 2;
    doc.setDrawColor(200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(30, yPosition, cardWidth, 130, 3, 3, "FD");
    doc.roundedRect(45 + cardWidth, yPosition, cardWidth + 15, 130, 3, 3, "FD"); // Bill From card

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill From", 30 + cardWidth / 2, yPosition + 20, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    addBoldText("Company Name:", 40, yPosition + 50);
    doc.text("VilleDishes", 160, yPosition + 50);
    addBoldText("Company Email:", 40, yPosition + 65);
    doc.text("villedishes@gmail.com", 160, yPosition + 65);
    addBoldText("Company Phone:", 40, yPosition + 80);
    doc.text("587-984-4409", 160, yPosition + 80);
    doc.text("Pay via Interac using:", 40, yPosition + 95);
    addBoldText("villedishes@gmail.com", 160, yPosition + 95); // Bill To card

    doc.setFont("helvetica", "bold");
    doc.text("Bill To", 45 + cardWidth * 1.5, yPosition + 20, {
      align: "center",
    });
    doc.setFont("helvetica", "normal"); // define width available inside the card

    const billToContentX = 55 + cardWidth;
    const billToValueX = 145 + cardWidth;
    const contentMaxWidth = cardWidth - 100; // adjust for padding
    // helper to wrap text

    const writeWrappedText = (label: string, value: string, startY: number) => {
      addBoldText(label, billToContentX, startY);

      const wrapped = doc.splitTextToSize(value || "", contentMaxWidth);
      doc.text(wrapped, billToValueX, startY); // return height used

      return wrapped.length * 12; // approx line height
    };

    let billToY = yPosition + 50; // Name

    billToY +=
      writeWrappedText("Customer Name:", data.customerName, billToY) + 10; // Email

    billToY +=
      writeWrappedText("Customer Email:", data.customerEmail, billToY) + 10; // Phone

    billToY +=
      writeWrappedText("Customer Phone:", data.customerPhone, billToY) + 10;

    yPosition += 140; // Invoice Overview (optimized)

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
          yPosition + 40,
        );
        addBoldText("Paid:", labelX + columnWidth, yPosition + 60);
        doc.text(
          formattedCurrency.format(data.amountPaid),
          valueX + columnWidth,
          yPosition + 60,
        );
        addBoldText("Due:", labelX + columnWidth, yPosition + 80);
        doc.text(
          formattedCurrency.format(data.amountDue),
          valueX + columnWidth,
          yPosition + 80,
        );
      },
      pageWidth - 60,
      120,
    ); // Product Details based on display mode

    if (products && products.length > 0) {
      if (displayMode === "category-summary") {
        // Category Summary Mode - Just show categories and totals
        const categorySummary = getCategorySummary(products);

        const tableColumn = [
          ...(isColumnVisible("serialNumber")
            ? [getColumnHeader("serialNumber")]
            : []),
          getColumnHeader("category"),
          getColumnHeader("total"),
        ];

        const tableRows = categorySummary.map((item, index) => [
          ...(isColumnVisible("serialNumber") ? [index + 1] : []),
          getCategoryDisplayName(item.category),
          item.total.toFixed(2),
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

        autoTable(doc, tableOptions);
        yPosition = (doc as any).lastAutoTable?.finalY
          ? (doc as any).lastAutoTable.finalY + 10
          : yPosition + 200;
      } else if (displayMode === "category-grouped") {
        // Category Grouped Mode - Show categories with products under each
        const categoryGroups = groupProductsByCategory(products);

        categoryGroups.forEach((group, groupIndex) => {
          // Add category header
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 40;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(44, 62, 80);
          doc.text(
            `${getCategoryDisplayName(group.category)} - ${formattedCurrency.format(group.subtotal)}`,
            30,
            yPosition + 10,
          );
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          const allDiscountsZero = group.products.every(
            (product) => (product.discount || 0) === 0,
          );

          const tableColumn = [
            ...(isColumnVisible("serialNumber")
              ? [getColumnHeader("serialNumber")]
              : []),
            ...(isColumnVisible("product") ? [getColumnHeader("product")] : []),
            ...(isColumnVisible("price") ? [getColumnHeader("price")] : []),
            ...(isColumnVisible("quantity")
              ? [getColumnHeader("quantity")]
              : []),
            ...(allDiscountsZero || !isColumnVisible("discount")
              ? []
              : [getColumnHeader("discount")]),
            ...(isColumnVisible("total") ? [getColumnHeader("total")] : []),
          ];

          const tableRows = group.products.map((product, index) => {
            const originalTotal = (
              product.basePrice * product.quantity
            ).toFixed(2);
            const discountedTotal = (
              product.basePrice *
              product.quantity *
              (1 - (product.discount || 0) / 100)
            ).toFixed(2);

            const row = [
              ...(isColumnVisible("serialNumber") ? [index + 1] : []),
              ...(isColumnVisible("product")
                ? [getProductDisplayName(product.id, product.name)]
                : []),
              ...(isColumnVisible("price")
                ? [getPriceDisplay(product.id, product.basePrice)]
                : []),
              ...(isColumnVisible("quantity")
                ? [getQuantityDisplay(product.id, product.quantity)]
                : []),
              ...(allDiscountsZero || !isColumnVisible("discount")
                ? []
                : [product.discount || 0]),
              ...(isColumnVisible("total") ? [discountedTotal] : []),
            ]; // Add hidden originalTotal for strikethrough effect

            if (isColumnVisible("total")) {
              row.push(originalTotal);
            }

            return row;
          });

          const totalColumnIndex = tableColumn.length - 1;

          const tableOptions: UserOptions = {
            head: [tableColumn],
            body: tableRows,
            startY: yPosition + 20,
            theme: "grid",
            bodyStyles: { textColor: 50, fontSize: 9 },
            alternateRowStyles: { fillColor: [242, 242, 242] },
            headStyles: {
              fillColor: [245, 174, 7],
              textColor: 255,
              fontStyle: "bold",
              fontSize: 9,
            },
            margin: { top: 20, right: 30, bottom: 40, left: 30 },
            columnStyles: {
              [tableColumn.length]: { cellWidth: 0, halign: "left" },
            },
            didDrawCell: function (data) {
              if (!isColumnVisible("total")) return;

              const cell = data.cell;
              if (data.column.index !== totalColumnIndex) return;

              const hasDiscount =
                typeof (data.row.raw as any)[tableColumn.length] !==
                  "undefined" &&
                (data.row.raw as any)[tableColumn.length] !== data.cell.text[0];

              if (!hasDiscount) return;

              const doc = data.doc;
              const originalTotal = (data.row.raw as any)[tableColumn.length];
              const pos = cell.getTextPos();
              const discountedX = pos.x;
              const discountedY = pos.y;
              const discountedWidth = doc.getTextWidth(cell.text[0]);
              const padding = 6;
              const verticalOffset = 7;
              const originalX = discountedX + discountedWidth + padding;
              const originalY = discountedY + verticalOffset;

              doc.setFontSize(8);
              doc.setTextColor(150);
              doc.text(originalTotal, originalX, originalY);

              const originalWidth = doc.getTextWidth(originalTotal);
              doc.setDrawColor(150);
              doc.setLineWidth(0.6);
              doc.line(
                originalX,
                originalY - 3,
                originalX + originalWidth,
                originalY - 3,
              );

              doc.setFontSize(9);
              doc.setTextColor(50);
            },
          };

          autoTable(doc, tableOptions);
          yPosition = (doc as any).lastAutoTable?.finalY
            ? (doc as any).lastAutoTable.finalY + 15
            : yPosition + 100;
        });
      } else {
        // Detailed Mode - Show all products in one table (original behavior)
        const allDiscountsZero = products.every(
          (product) => (product.discount || 0) === 0,
        );

        const tableColumn = [
          ...(isColumnVisible("serialNumber")
            ? [getColumnHeader("serialNumber")]
            : []),
          ...(isColumnVisible("product") ? [getColumnHeader("product")] : []),
          ...(isColumnVisible("price") ? [getColumnHeader("price")] : []),
          ...(isColumnVisible("quantity") ? [getColumnHeader("quantity")] : []),
          ...(allDiscountsZero || !isColumnVisible("discount")
            ? []
            : [getColumnHeader("discount")]),
          ...(isColumnVisible("total") ? [getColumnHeader("total")] : []),
        ];

        const tableRows = products.map((product, index) => {
          const originalTotal = (product.basePrice * product.quantity).toFixed(
            2,
          );
          const discountedTotal = (
            product.basePrice *
            product.quantity *
            (1 - (product.discount || 0) / 100)
          ).toFixed(2);

          const row = [
            ...(isColumnVisible("serialNumber") ? [index + 1] : []),
            ...(isColumnVisible("product")
              ? [getProductDisplayName(product.id, product.name)]
              : []),
            ...(isColumnVisible("price")
              ? [getPriceDisplay(product.id, product.basePrice)]
              : []),
            ...(isColumnVisible("quantity")
              ? [getQuantityDisplay(product.id, product.quantity)]
              : []),
            ...(allDiscountsZero || !isColumnVisible("discount")
              ? []
              : [product.discount || 0]),
            ...(isColumnVisible("total") ? [discountedTotal] : []),
          ]; // Add hidden originalTotal for strikethrough effect

          if (isColumnVisible("total")) {
            row.push(originalTotal);
          }

          return row;
        });

        const totalColumnIndex = tableColumn.length - 1;

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
          columnStyles: {
            [tableColumn.length]: { cellWidth: 0, halign: "left" },
          },
          didDrawCell: function (data) {
            if (!isColumnVisible("total")) return;

            const cell = data.cell;
            const totalColumnIndex = tableColumn.length - 1;

            if (data.column.index !== totalColumnIndex) return;

            const hasDiscount =
              typeof (data.row.raw as any)[tableColumn.length] !==
                "undefined" &&
              (data.row.raw as any)[tableColumn.length] !== data.cell.text[0];

            if (!hasDiscount) return;

            const doc = data.doc;
            const originalTotal = (data.row.raw as any)[tableColumn.length];
            const pos = cell.getTextPos();
            const discountedX = pos.x;
            const discountedY = pos.y;
            const discountedWidth = doc.getTextWidth(cell.text[0]);
            const padding = 6;
            const verticalOffset = 7;
            const originalX = discountedX + discountedWidth + padding;
            const originalY = discountedY + verticalOffset;

            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(originalTotal, originalX, originalY);

            const originalWidth = doc.getTextWidth(originalTotal);
            doc.setDrawColor(150);
            doc.setLineWidth(0.6);
            doc.line(
              originalX,
              originalY - 3,
              originalX + originalWidth,
              originalY - 3,
            );

            doc.setFontSize(10);
            doc.setTextColor(50);
          },
        };

        autoTable(doc, tableOptions);
        yPosition = (doc as any).lastAutoTable?.finalY
          ? (doc as any).lastAutoTable.finalY + 10
          : yPosition + 200;
      }
    } // Invoice Summary (optimized)

    addCard(
      "Invoice Summary",
      () => {
        // Use the products array we created from InvoiceProducts
        const subtotal = products.reduce((sum, product) => {
          // Add safety checks for product properties
          const basePrice = product?.basePrice || 0;
          const quantity = product?.quantity || 0;
          const discount = product?.discount || 0;

          return sum + basePrice * quantity * (1 - discount / 100);
        }, 0);

        const discountPercentage = data.discountPercentage || 0;
        const discountType = data.discountType || "PERCENT";
        const taxRate = data.taxRate || 0;
        const taxType = data.taxType || "PERCENT";
        const shippingFee = data.shippingFee || 0;

        const discountAmount =
          discountType === "PERCENT"
            ? subtotal * (discountPercentage / 100)
            : discountPercentage;
        const taxAmount =
          taxType === "PERCENT" ? subtotal * (taxRate / 100) : taxRate;
        const total = subtotal - discountAmount + taxAmount + shippingFee;

        const addSummaryRow = (
          label: string,
          value: string,
          y: number,
          isBold = false,
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
          yPosition + 40 + lineHeight,
        );
        addSummaryRow(
          "Tax:",
          `$${taxAmount.toFixed(2)}`,
          yPosition + 40 + lineHeight * 2,
        );
        addSummaryRow(
          "Shipping Fee:",
          `$${shippingFee.toFixed(2)}`,
          yPosition + 40 + lineHeight * 3,
        );
        addSummaryRow(
          "Total:",
          `$${total.toFixed(2)}`,
          yPosition + 40 + lineHeight * 4,
          true,
        );
      },
      pageWidth - 60,
      140,
    ); // Footer (optimized)

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 20, {
      align: "center",
    }); // Return optimized PDF data as Uint8Array

    const pdfOutput = doc.output("arraybuffer") as ArrayBuffer;
    return new Uint8Array(pdfOutput);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};

export const createInvoicePDFPreview = async (
  data: Invoice,
  displayMode: InvoiceDisplayMode = "detailed",
  categoryMappings: Record<string, string> = {},
  columnMappings: ColumnMappings = DEFAULT_COLUMN_MAPPINGS,
): Promise<string> => {
  try {
    const pdfData = await createInvoicePDF(
      data,
      displayMode,
      categoryMappings,
      columnMappings,
    );

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
