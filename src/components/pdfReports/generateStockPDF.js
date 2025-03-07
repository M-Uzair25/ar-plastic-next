import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export function generateStockPDF(stockData, totalBags, totalKg, totalPurchasedValue, totalSellValue) {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);  // Dark Blue for title
    doc.setFont("helvetica", "bold");
    doc.text('Abdul Razzaq Plastic', 105, 20, { align: 'center' });

    const currentDate = format(new Date(), 'dd MMM yyyy hh:mm a');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);  // Black for subtitle
    doc.setFont("helvetica", "normal");
    doc.text(`Stock Report: ${currentDate}`, 105, 30, { align: 'center' });

    // Prepare the stock data for the table
    const tableData = stockData.map((item, index) => [
        index + 1,
        item.category,
        item.description,
        {
            content: `${item.bagQuantity} Bags, ${item.kgQuantity} Kg`,
            styles: {
                textColor: (item.bagQuantity <= item.stockLimit) ? [255, 0, 0] : [0, 0, 0],  // Red for zero, Black otherwise
            }
        },
        format(new Date(item.updatedAt), 'dd/MM/yy hh:mm a')
    ]);

    // Define table columns
    const columns = [
        { header: '#', dataKey: '#' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Description', dataKey: 'description' },
        { header: 'Stock', dataKey: 'stock' },
        { header: 'Last Updated', dataKey: 'updatedAt' }
    ];

    // Add the table to the PDF
    doc.autoTable({
        head: [columns.map(col => col.header)],
        body: tableData,
        startY: 37,
        styles: {
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            textColor: [0, 0, 0],
            fontSize: 10,
        },
        headStyles: {
            fillColor: [220, 220, 220],  // Light gray for headers
            fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
    });

    // Add stock summary at the end of the table
    const finalYPosition = doc.autoTable.previous.finalY + 10; // Adjusted spacing after table
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`Total Items: ${stockData.length}`, 14, finalYPosition);
    doc.text(`Total Quantity: ${totalBags} Bags, ${totalKg} Kg`, 14, finalYPosition + 7);
    doc.text(`Total Amount of Stock in terms of Purchased Rate: ${totalPurchasedValue.toLocaleString()} Rs`, 14, finalYPosition + 14);
    doc.text(`Total Amount of Stock in terms of Sell Rate: ${totalSellValue.toLocaleString()} Rs`, 14, finalYPosition + 21);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy')}`, 15, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 35, doc.internal.pageSize.height - 10);
    }

    // Generate the PDF as a Blob and open it automatically in a new tab
    const pdfBlob = doc.output('blob'); // Generate PDF as a Blob
    const pdfUrl = URL.createObjectURL(pdfBlob); // Create a Blob URL
    window.open(pdfUrl); // Open the PDF in a new tab
}
