import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export function generatePurchasePDF(purchases) {
  const doc = new jsPDF();

  // Add the title with larger font size and bold
  doc.setFontSize(22);
  doc.setTextColor(0, 51, 102);  // Dark Blue for title
  doc.setFont("helvetica", "bold");
  doc.text('Abdul Razzaq Plastic', 105, 20, { align: 'center' });

  // Add subtitle with smaller font size
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);  // Black for subtitle
  doc.setFont("helvetica", "normal");
  doc.text('Purchase Report', 105, 30, { align: 'center' });

  // Table columns and data
  const tableColumn = [
    '#', 'Date', 'Supplier', 'Bag Qty', 'Kg Qty', 'Category', 'Description', 'Pound Rate', 'Bag Rate', 'Total Amount'
  ];

  const tableRows = purchases.map((purchase, index) => [
    index + 1,
    format(new Date(purchase.createdAt), 'dd/MM/yy'),
    purchase.supplierName,
    purchase.bagQuantity || '',
    purchase.kgQuantity || '',
    purchase.category,
    purchase.description,
    purchase.poundRate,
    purchase.bagRate,
    purchase.total
  ]);

  // Generate table
  doc.autoTable({
    head: [tableColumn],
    headStyles: {
      fillColor: [220, 220, 220],
    },
    body: tableRows,
    startY: 35,
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      textColor: [0, 0, 0],
      valign: 'middle',
      fontSize: 10  // Set font size for table content
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
  });

  // Calculate summary data
  const totalPurchases = purchases.length;
  const totalBagQuantity = purchases.reduce((sum, purchase) => sum + (purchase.bagQuantity || 0), 0);
  const totalKgQuantity = purchases.reduce((sum, purchase) => sum + (purchase.kgQuantity || 0), 0);
  const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);

  const finalYPosition = doc.autoTable.previous.finalY + 12;
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text('Purchase Summary:', 40, finalYPosition, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Purchases: ${totalPurchases}`, 13, finalYPosition + 8);
  doc.text(`Total Bag Quantity: ${totalBagQuantity} Bags`, 13, finalYPosition + 16);
  doc.text(`Total Kg Quantity: ${totalKgQuantity} Kg`, 13, finalYPosition + 24);
  doc.text(`Total Amount: ${totalAmount.toLocaleString()} Rs`, 13, finalYPosition + 32);

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