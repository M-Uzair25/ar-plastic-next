import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export function generateSalesPDF(sales, startDate, endDate) {
    const doc = new jsPDF();

    // Format the dates using date-fns
    const formattedStartDate = format(startDate, 'dd MMM yyyy');
    const formattedEndDate = endDate ? format(endDate, 'dd MMM yyyy') : '';

    // Add the title with larger font size and bold
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);  // Dark Blue for title
    doc.setFont("helvetica", "bold");
    doc.text('Abdul Razzaq Plastic', 105, 20, { align: 'center' });

    // Add subtitle with smaller font size
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);  // Black for subtitle
    doc.setFont("helvetica", "normal");
    doc.text(`Sales Report: ${formattedStartDate} - ${formattedEndDate}`, 105, 30, { align: 'center' });

    // Reverse the sales data to have it in ascending order
    const sortedSales = sales.slice().reverse();

    // Prepare the sales data for the table
    const tableData = sortedSales.flatMap((sale) => {
        const formattedDate = format(new Date(sale.createdAt), 'dd/MM/yy');
        const numberOfItems = sale.cartItems.length;

        return sale.cartItems.map((item, index) => ({
            date: index === 0 ? { content: formattedDate, rowSpan: numberOfItems, valign: 'middle' } : '',
            customer: index === 0 ? { content: sale.customerName, rowSpan: numberOfItems, valign: 'middle' } : '',
            bagQuantity: item.bagQuantity || '',
            kgQuantity: item.kgQuantity || '',
            category: item.category || '',
            description: item.description || '',
            subTotal: item.subTotal || '',
            total: index === 0 ? { content: sale.total, rowSpan: numberOfItems, valign: 'middle' } : '',
            cashPaid: index === 0 ? { content: sale.cashPaid, rowSpan: numberOfItems, valign: 'middle' } : '',
            remarks: index === 0 ? { content: sale.remarks || '', rowSpan: numberOfItems, valign: 'middle' } : ''
        }));
    });

    // Calculate total quantities and amount
    const totalBags = sortedSales.reduce((sum, sale) => sum + sale.cartItems.reduce((subSum, item) => subSum + item.bagQuantity, 0), 0);
    const totalKgs = sortedSales.reduce((sum, sale) => sum + sale.cartItems.reduce((subSum, item) => subSum + item.kgQuantity, 0), 0);
    const totalAmount = sortedSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCashPaid = sortedSales.reduce((sum, sale) => sum + sale.cashPaid, 0);

    // Define table columns
    const columns = [
        { header: 'Date', dataKey: 'date' },
        { header: 'Customer', dataKey: 'customer' },
        { header: 'Bag Qty', dataKey: 'bagQuantity' },
        { header: 'Kg Qty', dataKey: 'kgQuantity' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Description', dataKey: 'description' },
        { header: 'Sub Total', dataKey: 'subTotal' },
        { header: 'Amount', dataKey: 'total' },
        { header: 'Cash Paid', dataKey: 'cashPaid' },
        { header: 'Remarks', dataKey: 'remarks' }
    ];

    // Add the table to the PDF with row spanning and vertical alignment
    doc.autoTable({
        columns: columns,
        body: tableData,
        startY: 37,
        styles: {
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            textColor: [0, 0, 0],
            valign: 'middle',
            fontSize: 10  // Set font size for table content
        },
        headStyles: {
            fillColor: [220, 220, 220],  // Light gray for headers
            fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
    });

    // Add sales summary at the end of the table
    const finalYPosition = doc.autoTable.previous.finalY + 15; // Adjusted spacing after table
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`Total Sales: ${sortedSales.length}`, 15, finalYPosition);
    doc.text(`Total Bag Quantity: ${totalBags}`, 15, finalYPosition + 7);
    doc.text(`Total Kg Quantity: ${totalKgs}`, 15, finalYPosition + 14);
    doc.text(`Total Amount: ${totalAmount.toFixed(0)} Rs`, 15, finalYPosition + 21);
    doc.text(`Total Cash Paid: ${totalCashPaid.toFixed(0)} Rs`, 15, finalYPosition + 28);

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
