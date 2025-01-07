import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateSaleReceipt(saleData, date, discount) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 160], // Width: 100mm, Height: 160mm
    });

    // Header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ABDUL RAZZAQ PLASTIC TRADERS", 50, 10, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("We Deal in All Kinds Of Plastic Raw Materials, Chemicals & Colours.", 50, 15, { align: "center" });
    doc.text("Near Lakar Mandi Chowk, Railway Road, Multan. 0300 6355827", 50, 20, { align: "center" });

    // Customer and date details
    doc.setFontSize(8);
    doc.text(`Customer: ${saleData.customerName || "Walk-in"}`, 5, 27);
    doc.text(`Date: ${date}`, 5, 32);

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
        startY: 37,
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
    doc.text(`Total: ${saleData.total} Rs`, 95, finalY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Cash Received: ${saleData.cashPaid} Rs`, 95, finalY + 5, { align: "right" });
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
    doc.text("Thank you for shopping with us!", 50, finalY + 25, { align: "center" });
    // Terms and Conditions
    doc.text("1. Returns or replacements must be made within 15 days with the receipt.", 5, finalY + 30);
    doc.text("2. Nylon and PU items are non-returnable.", 5, finalY + 35);

    // Generate the PDF as a Blob and open it automatically in a new tab
    const pdfBlob = doc.output("blob"); // Generate PDF as a Blob
    const pdfUrl = URL.createObjectURL(pdfBlob); // Create a Blob URL
    window.open(pdfUrl); // Open the PDF in a new tab
}