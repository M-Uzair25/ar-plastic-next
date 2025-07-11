import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateSaleReceipt(saleData, date) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 160], // Width: 100mm, Height: 160mm
    });

    // Header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("AR. PLASTIC TRADERS", 50, 10, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("We Deal in All Kinds Of Plastic Raw Materials, Chemicals & Colours.", 50, 15, { align: "center" });
    doc.text("Near Lakar Mandi Chowk, Railway Road, Multan. 0300 6355827", 50, 20, { align: "center" });

    // Customer and date details
    doc.setFontSize(8);
    doc.text(`Customer: ${saleData.customerName || "Walk-in"}`, 5, 27);
    doc.text(`Date: ${date}`, 5, 32);
    doc.setFont("helvetica", "bold");
    doc.text(`Bill No: ${saleData.billNo}`, 70, 30);
    doc.text(`Remarks:`, 5, 37);
    doc.setFont("helvetica", "normal");
    doc.text(`${saleData.remarks}`, 20, 37);

    // Table content for items
    const tableData = saleData.cartItems.map((item, index) => {
        const kgQuantity = item.kgQuantity % 1 === 0 ? parseInt(item.kgQuantity, 10) : parseFloat(item.kgQuantity).toFixed(3);
        return [
            index + 1,
            `${item.category} ${item.description}`,
            `${item.bagQuantity} x ${item.bagRate || 0}/-`,
            `${kgQuantity} x ${item.perKgRate || 0}/-`,
            item.subTotal.toLocaleString(),
        ];
    });

    doc.autoTable({
        startY: 42,
        head: [["#", "Item", "Bags", "Kg", "Sub Total"]],
        body: tableData,
        styles: {
            fontSize: 7,
            cellPadding: 1,
            textColor: [0, 0, 0],
            fillColor: [255, 255, 255],
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        margin: { left: 5, right: 5 },
        alternateRowStyles: { fillColor: [255, 255, 255] },
    });

    // Summary section
    let finalY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${saleData.total.toLocaleString()} Rs`, 95, finalY, { align: "right" });
    doc.setFont("helvetica", "normal");

    if (saleData.discount > 0) {
        finalY += 5;
        doc.text(`Discount: ${saleData.discount} Rs`, 95, finalY, { align: "right" });
    }
    if (saleData.freightCharges > 0) {
        finalY += 5;
        doc.text(`Freight Charges: ${saleData.freightCharges} Rs`, 95, finalY, { align: "right" });
    }
    if (saleData.discount > 0 || saleData.freightCharges > 0) {
        finalY += 5;
        doc.setFont("helvetica", "bold");
        doc.text(`Gross Total: ${(parseInt(saleData.total) - parseInt(saleData.discount) + parseInt(saleData.freightCharges)).toLocaleString()} Rs`, 95, finalY, { align: "right" });
    }
    doc.setFont("helvetica", "normal");
    if (saleData.cashReceived > 0) {
        finalY += 5;
        doc.text(`Cash Received: ${saleData.cashReceived.toLocaleString()} Rs`, 95, finalY, { align: "right" });
    }
    if (saleData.accountAmount > 0) {
        finalY += 5;
        doc.text(`Account Transfer: ${saleData.accountAmount.toLocaleString()} Rs`, 95, finalY, { align: "right" });
    }

    // Footer
    doc.setFontSize(7);
    doc.text("Thank you for shopping with us!", 50, finalY + 5, { align: "center" });
    // Terms and Conditions
    doc.text("1. Returns or replacements must be made within 15 days with the receipt.", 5, finalY + 10);
    doc.text("2. Nylon and PU items are non-returnable.", 5, finalY + 15);

    // Generate the PDF as a Blob and open it automatically in a new tab
    const pdfBlob = doc.output("blob"); // Generate PDF as a Blob
    const pdfUrl = URL.createObjectURL(pdfBlob); // Create a Blob URL
    window.open(pdfUrl); // Open the PDF in a new tab
}