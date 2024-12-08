import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { logoImageData } from "./imageData";
import { formattedCurrency } from "./helper";

// export const createInvoicePDF:Promise<Buffer> = (data: Invoice) => {}
export const createInvoicePDF = (data: Invoice): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    try {
      const imageData = logoImageData;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      let yPosition = 20;

      // Helper function to add a card-like section
      const addCard = (
        title: string,
        content: () => void,
        width: number,
        height: number
      ) => {
        if (yPosition + height > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        // Card styling and layout
        doc.setDrawColor(200);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(10, yPosition, width, height, 3, 3, "FD");

        // Title styling and placement
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text(title, 10 + width / 2, yPosition + 10, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        content();
        yPosition += height + 5; // Reduced spacing between sections
      };

      // Helper function to add bold text
      const addBoldText = (text: string, x: number, y: number) => {
        doc.setFont("helvetica", "bold");
        doc.text(text, x, y);
        doc.setFont("helvetica", "normal");
      };

      // Add header with invoice title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80);
      doc.text("INVOICE", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Bill From and Bill To cards side by side
      const cardWidth = (pageWidth - 30) / 2;
      doc.setDrawColor(200);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(10, yPosition, cardWidth, 60, 3, 3, "FD");
      doc.roundedRect(20 + cardWidth, yPosition, cardWidth, 60, 3, 3, "FD");

      // Bill From card
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Bill From", 10 + cardWidth / 2, yPosition + 10, {
        align: "center",
      });

      doc.addImage(imageData, "PNG", 15, yPosition + 1, 20, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      addBoldText("Company Name:", 15, yPosition + 25);
      doc.text("VilleDishes", 50, yPosition + 25);
      addBoldText("Company Email:", 15, yPosition + 35);
      doc.text("villedishes@gmail.com", 50, yPosition + 35);
      addBoldText("Company Phone:", 15, yPosition + 45);
      doc.text("587-984-4409", 50, yPosition + 45);
      doc.text("Pay via Interac using:", 15, yPosition + 55);
      addBoldText("villedishes@gmail.com", 50, yPosition + 55);

      // Bill To card
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Bill To", 20 + cardWidth * 1.5, yPosition + 10, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      addBoldText("Customer Name:", 25 + cardWidth, yPosition + 25);
      doc.text(data.customerName, 65 + cardWidth, yPosition + 25);
      addBoldText("Customer Email:", 25 + cardWidth, yPosition + 35);
      doc.text(data.customerEmail, 65 + cardWidth, yPosition + 35);
      addBoldText("Customer Phone:", 25 + cardWidth, yPosition + 45);
      doc.text(data.customerPhone, 65 + cardWidth, yPosition + 45);

      yPosition += 65;

      // Invoice Overview card
      addCard(
        "Invoice Overview",
        () => {
          const labelX = 15;
          const valueX = 15;
          const lineHeight = 7;
          const columnWidth = (pageWidth - 30) / 4;

          doc.setFont("helvetica", "bold");
          doc.text("Invoice Number", labelX, yPosition + 20);
          doc.text("Date Created", labelX + 50, yPosition + 20);
          doc.text("Due Date", labelX + 100, yPosition + 20);
          doc.text("Status", labelX + 150, yPosition + 20);

          doc.setFont("helvetica", "normal");
          doc.text(data.invoiceNumber, valueX, yPosition + 20 + lineHeight);
          doc.text(data.dateCreated, valueX + 50, yPosition + 20 + lineHeight);
          doc.text(data.dueDate, valueX + 100, yPosition + 20 + lineHeight);
          doc.text(data.status, valueX + 150, yPosition + 20 + lineHeight);

          doc.setFont("helvetica", "bold");
          doc.text("Invoice Amount", labelX, yPosition + 40);
          doc.text("Amount Paid", labelX + 70, yPosition + 40);
          doc.text("Amount Due", labelX + 140, yPosition + 40);

          doc.setFont("helvetica", "normal");
          doc.text(
            formattedCurrency.format(data.amount),
            valueX,
            yPosition + 40 + lineHeight
          );
          doc.text(
            formattedCurrency.format(data.amountPaid),
            valueX + 70,
            yPosition + 40 + lineHeight
          );
          doc.text(
            formattedCurrency.format(data.amountDue),
            valueX + 140,
            yPosition + 40 + lineHeight
          );
        },
        pageWidth - 20,
        60
      );

      // Product Details card
      addCard(
        "Invoice Product Details",
        () => {
          if (data.products && data.products.length > 0) {
            const tableColumn = [
              "S/N",
              "Product",
              "Base Price ($)",
              "Quantity",
              "Discount (%)",
              "Price ($)",
            ];
            const tableRows = data.products.map((product, index) => [
              index + 1,
              product.name,
              product.basePrice.toFixed(2),
              product.quantity,
              product.discount,
              (
                product.basePrice *
                product.quantity *
                (1 - product.discount / 100)
              ).toFixed(2),
            ]);

            // (doc as unknown as keyof typeof jsPDF).autoTable({
            doc.autoTable({
              startY: yPosition + 15,
              head: [tableColumn],
              body: tableRows,
              theme: "grid",
              headStyles: {
                fillColor: [245, 174, 7],
                textColor: 255,
                fontSize: 10,
                fontStyle: "bold",
              },
              bodyStyles: { textColor: 50, fontSize: 9 },
              alternateRowStyles: { fillColor: [242, 242, 242] },
              margin: { top: 15, right: 10, bottom: 10, left: 10 },
              // startY: yPosition + 15,
            });
          } else {
            doc.text("No products found", 15, yPosition + 25);
          }
        },
        pageWidth - 20,
        doc.autoTable.previous?.finalY
          ? doc.autoTable.previous?.finalY - yPosition + 20
          : 40
      );

      yPosition = doc.autoTable.previous?.finalY
        ? doc.autoTable.previous.finalY + 10
        : yPosition;

      // Invoice Summary card
      addCard(
        "Invoice Summary",
        () => {
          const subtotal = data.products
            ? data.products.reduce(
                (sum, product) =>
                  sum +
                  product.basePrice *
                    product.quantity *
                    (1 - product.discount / 100),
                0
              )
            : 0;
          const discountAmount =
            subtotal * ((data.discountPercentage || 0) / 100);
          const taxAmount = subtotal * ((data.taxRate || 0) / 100);
          const total =
            subtotal - discountAmount + taxAmount + (data.shippingFee || 0);

          const addSummaryRow = (
            label: string,
            value: string,
            y: number,
            isBold: boolean = false
          ) => {
            if (isBold) doc.setFont("helvetica", "bold");
            doc.text(label, 15, y);
            doc.text(value, pageWidth - 15, y, { align: "right" });
            if (isBold) doc.setFont("helvetica", "normal");
          };

          addSummaryRow("Subtotal:", `$${subtotal.toFixed(2)}`, yPosition + 25);
          addSummaryRow(
            "Discount(on subtotal):",
            `$${discountAmount.toFixed(2)}`,
            yPosition + 32
          );
          addSummaryRow("Tax:", `$${taxAmount.toFixed(2)}`, yPosition + 39);
          addSummaryRow(
            "Shipping Fee:",
            `$${(data.shippingFee || 0).toFixed(2)}`,
            yPosition + 46
          );
          addSummaryRow("Total:", `$${total.toFixed(2)}`, yPosition + 56, true);
        },
        pageWidth - 20,
        70
      );

      // Add a footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 10, {
        align: "center",
      });

      // Return PDF data as Uint8Array
      const pdfOutput = doc.output("arraybuffer");
      resolve(new Uint8Array(pdfOutput));
    } catch (error) {
      reject(error);
    }
  });
};
