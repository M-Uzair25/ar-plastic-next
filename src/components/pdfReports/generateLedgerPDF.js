import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function generateLedgerPDF(ledgerData, startDate, endDate, totalDebit, totalCredit, closingBalance) {

    if (!ledgerData.length) {
        toast.error('No data to download.');
        return;
    }

    console.log(ledgerData)

    const doc = new jsPDF();

    // Add the title with larger font size and bold
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);  // Dark Blue for title
    doc.setFont("helvetica", "bold");
    doc.text('Abdul Razzaq Plastic', 105, 20, { align: 'center' });

    // Add subtitle
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Ledger Report: ${ledgerData[0].party}`, 14, 30);

    // Add date range
    doc.setFontSize(12);
    doc.text(
        `From: ${startDate ? startDate.toLocaleDateString() : 'N/A'} To: ${endDate ? endDate.toLocaleDateString() : 'N/A'}`,
        140,
        30
    );

    // Add summary
    doc.text(`Total Debit: ${totalDebit} Rs | Total Credit: ${totalCredit} Rs`, 14, 40);
    doc.text(`Closing Balance: ${closingBalance} Rs`, 140, 40);

    // Prepare table data
    const tableColumn = ['Date', 'Description', 'Debit', 'Credit', 'Balance'];
    const tableRows = ledgerData.map((entry) => [
        format(new Date(entry.createdAt), 'dd/MM/yy'),
        entry.description,
        entry.debit || '-',
        entry.credit || '-',
        entry.balance,
    ]);

    // Add table
    doc.autoTable({
        head: [tableColumn],
        headStyles: {
            fillColor: [220, 220, 220],
        },
        body: tableRows,
        startY: 47,
        styles: {
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
    });

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
};
