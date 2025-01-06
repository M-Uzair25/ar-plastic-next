import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateSaleReceipt(saleData, date, discount) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 150], // Width: 80mm, Height: 150mm
    });

    // Header
    doc.setFontSize(10);
    doc.text("Abdul Razzaq Plastic Materials", 40, 10, { align: "center" });
    doc.setFontSize(8);
    doc.text("Near Lakar Mandi Chowk, Railway Road, Multan", 40, 15, { align: "center" });
    doc.text("0300 6355827", 40, 20, { align: "center" });

    // Customer and date details
    doc.setFontSize(8);
    doc.text(`Customer: ${saleData.customerName || "Walk-in"}`, 5, 25);
    doc.text(`Date: ${date}`, 5, 30);

    // Table content for items
    const tableData = saleData.cartItems.map((item, index) => {
        const kgQuantity = item.kgQuantity % 1 === 0 ? parseInt(item.kgQuantity, 10) : item.kgQuantity;
        return [
            index + 1,
            `${item.category} ${item.description}`,
            `${item.bagQuantity} x${item.bagRate || 0}/-`,
            `${kgQuantity} x${item.perKgRate || 0}/-`,
            item.subTotal,
        ];
    });

    doc.autoTable({
        startY: 35,
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
    doc.text(`Total: ${saleData.total} Rs`, 5, finalY);
    doc.text(`Cash Received: ${saleData.cashPaid} Rs`, 5, finalY + 5);
    let x = 5;
    if (discount > 0) {
        x += 5;
        doc.text(`Discount: ${discount} Rs`, 5, finalY + x);
    }
    if (saleData.accountAmount > 0) {
        x += 5;
        doc.text(`Account Transfer: ${saleData.accountAmount} Rs`, 5, finalY + x);
    }

    // Footer
    doc.setFontSize(7);
    doc.text("Thank you for shopping with us!", 40, finalY + 25, { align: "center" });

    // Generate the PDF as a Blob and open it automatically in a new tab
    const pdfBlob = doc.output("blob"); // Generate PDF as a Blob
    const pdfUrl = URL.createObjectURL(pdfBlob); // Create a Blob URL
    window.open(pdfUrl); // Open the PDF in a new tab
}