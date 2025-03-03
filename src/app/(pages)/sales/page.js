'use client';
import { useState, useEffect } from 'react';
import { Row, Col, Table, Card, CardTitle, CardBody, Button, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Accounts from '@/components/Accounts';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { generateSalesPDF } from '@/components/pdfReports/generateSalesPDF';
import { generateSaleReceipt } from '@/components/pdfReports/generateSaleReceipt';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [message, setMessage] = useState('');

  // States for column-specific search inputs
  const [customerName, setCustomerName] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [bagQuantitySearch, setBagQuantitySearch] = useState('');
  const [kgQuantitySearch, setKgQuantitySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [subTotalSearch, setSubTotalSearch] = useState('');
  const [amountSearch, setAmountSearch] = useState('');
  const [cashReceivedSearch, setCashReceivedSearch] = useState('');
  const [remarksSearch, setRemarksSearch] = useState('');

  const handleNameChange = async (selectedOption) => {
    setCustomerName(selectedOption);
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption : null);
  };

  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
  };

  // Function to fetch sales data with optional date range and search filters
  const fetchSales = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (customerName) queryParams.append('customerName', customerName.value);
      if (selectedCategory) queryParams.append('category', selectedCategory.value);
      if (selectedDescription) queryParams.append('description', selectedDescription.value);

      if (startDate) queryParams.append('startDate', format(startDate, 'yyyy-MM-dd'));
      if (endDate) queryParams.append('endDate', format(endDate, 'yyyy-MM-dd'));

      const response = await fetch(`/api/sales?${queryParams.toString()}`);
      const data = await response.json();
      setSales(data.sales);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Error fetching sales data');
    }
  };

  // Trigger search whenever startDate, endDate, changes
  useEffect(() => {
    fetchSales();
  }, [startDate, endDate, customerName, selectedCategory]);

  // Handle print sales
  const handleDownloadPDF = () => {
    generateSalesPDF(sales, startDate, endDate, totalBags, totalKgs, totalAmount, totalCashSale, totalCashReceived);
  };

  const handleSaleReceipt = async (sale) => {
    try {
      const response = await fetch(`/api/sales/?id=${sale._id}`);
      const data = await response.json();
      if (response.ok) {
        const date = format(new Date(), 'dd/MM/yyyy hh:mm a');
        generateSaleReceipt(data.sale, date);
      } else {
        toast.error(`Error fetching sale receipt: ${data.message}`);
      }
    } catch (error) {
      console.error('Error fetching sale receipt:', error);
      toast.error('Error fetching sale receipt');
    }
  };

  // Handle return sale
  const handleReturnSale = (sale, event) => {
    event.stopPropagation(); // Prevent the row click event from being triggered

    if (sale.returned) {
      toast.error('Sale already returned');
      return;
    }

    let itemList = sale.cartItems
      .map((item) => `${item.bagQuantity} Bag, ${item.kgQuantity} Kg ${item.category} ${item.description}`)
      .join(', '); // Create a comma-separated list of items

    setMessage(`Return: ${sale.customerName}\nItems: ${itemList}\nTotal Amount: ${sale.total}`);
    setSelectedSale(sale); // Store the selected sale
    setModalOpen(true); // Open the modal
  };

  const confirmReturn = async () => {
    if (selectedSale) {
      try {
        const response = await fetch(`/api/sales?id=${selectedSale._id}`, { method: 'PUT' });

        const result = await response.json();
        if (response.ok) {
          fetchSales(startDate, endDate); // Refetch sales data
          toast.success('Sale returned successfully');
        } else {
          toast.error(`Error returning sale: ${result.message}`);
        }
      } catch (error) {
        console.error('Error returning sale:', error);
        toast.error('Error returning sale');
      } finally {
        setModalOpen(false); // Close the modal
        setSelectedSale(null); // Clear the selected sale
        setMessage('');
      }
    }
  };

  // Filtered sales based on column-specific and global search inputs
  const filteredSales = sales.filter((sale) => {
    const globalSearchLower = globalSearch.toLowerCase();

    const matchesGlobalSearch = [
      sale.customerName,
      sale.remarks,
      sale.total?.toString(),
      sale.cashReceived?.toString(),
      ...sale.cartItems.flatMap(item => [
        item.bagQuantity?.toString(),
        item.kgQuantity?.toString(),
        item.category,
        item.description,
        item.subTotal?.toString()
      ]),
    ].some(field => field?.toLowerCase().includes(globalSearchLower));

    const matchesColumnSpecificSearch = sale.cartItems.some((item) =>
      (item.bagQuantity?.toString().includes(bagQuantitySearch) || !bagQuantitySearch) &&
      (item.kgQuantity?.toString().includes(kgQuantitySearch) || !kgQuantitySearch) &&
      (item.subTotal?.toString().includes(subTotalSearch) || !subTotalSearch)
    ) &&
      (sale.total?.toString().includes(amountSearch) || !amountSearch) &&
      (sale.cashReceived?.toString().includes(cashReceivedSearch) || !cashReceivedSearch) &&
      (sale.remarks?.toLowerCase().includes(remarksSearch.toLowerCase()) || !remarksSearch);

    return matchesGlobalSearch && matchesColumnSpecificSearch;
  });

  // Calculate sales statistics
  const totalSales = filteredSales.length;
  const totalBags = filteredSales.reduce((sum, sale) =>
    sum + sale.cartItems.reduce((subSum, item) => subSum + item.bagQuantity, 0), 0);
  const totalKgs = filteredSales.reduce((sum, sale) =>
    sum + sale.cartItems.reduce((subSum, item) => subSum + item.kgQuantity, 0), 0);

  // New: Calculate total subtotal and total cashReceived
  const totalSubTotal = filteredSales.reduce((acc, sale) =>
    acc + sale.cartItems.reduce((cartAcc, item) => cartAcc + item.subTotal, 0), 0);

  const totalCashSale = filteredSales.reduce((acc, sale) =>
    sale.customerName === 'CASH' ? acc + sale.total : acc, 0
  );
  const totalCashReceived = filteredSales.reduce((acc, sale) => acc + sale.cashReceived, 0);

  const totalAmount = filteredSales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <>
      <ToastContainer />
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
          <i className="bi bi-card-text me-2"> </i>
          Sales {format(new Date(), 'dd MMM yyyy hh:mm a')}
        </CardTitle>
        <CardBody>
          <Row>
            <Col md={3}>
              <Label for="globalSearch">Search All</Label>
              <Input
                id="globalSearch"
                name="globalSearch"
                placeholder="Search"
                type="search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Label for="startDate">Start Date</Label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </Col>
            <Col md={2}>
              <Label for="endDate">End Date</Label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </Col>
            <Col>
              <Button className='mx-2' color="info" onClick={handleDownloadPDF} style={{ marginTop: '32px' }}>
                Download Report
              </Button>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <h6><strong>{startDate ? format(startDate, 'dd MMM yyyy') : ''} {endDate ? ' - ' + format(endDate, 'dd MMM yyyy') : ''}</strong></h6>
            </Col>
          </Row>

          <Table bordered hover responsive size="sm">
            <thead>
              <tr className="table-secondary">
                <th className='centered-cell'>
                  Search
                </th>
                <th></th>
                <th>
                  <Accounts onNameChange={handleNameChange} selectedName={customerName} />
                </th>
                <th>
                  <Input
                    id="bagQuantitySearch"
                    name="bagQuantitySearch"
                    placeholder="Bag"
                    type="search"
                    value={bagQuantitySearch}
                    onChange={(e) => setBagQuantitySearch(e.target.value)}
                  />
                </th>
                <th>
                  <Input
                    id="kgQuantitySearch"
                    name="kgQuantitySearch"
                    placeholder="Kg"
                    type="search"
                    value={kgQuantitySearch}
                    onChange={(e) => setKgQuantitySearch(e.target.value)}
                  />
                </th>
                <th>
                  <ItemCategory onCategoryChange={handleCategoryChange} selectedDescription={selectedDescription} />
                </th>
                <th>
                  <ItemDescription onDescriptionChange={handleDescriptionChange} selectedCategory={selectedCategory} />
                </th>
                <th>
                  <Input
                    id="subTotalSearch"
                    name="subTotalSearch"
                    placeholder="SubTotal"
                    type="search"
                    value={subTotalSearch}
                    onChange={(e) => setSubTotalSearch(e.target.value)}
                  />
                </th>
                <th>
                  <Input
                    id="amountSearch"
                    name="amountSearch"
                    placeholder="Amount"
                    type="search"
                    value={amountSearch}
                    onChange={(e) => setAmountSearch(e.target.value)}
                  />
                </th>
                <th>
                  <Input
                    id="cashReceived"
                    name="cashReceived"
                    placeholder="Received"
                    type="search"
                    value={cashReceivedSearch}
                    onChange={(e) => setCashReceivedSearch(e.target.value)}
                  />
                </th>
                <th>
                  <Input
                    id="remarksSearch"
                    name="remarksSearch"
                    placeholder="Remarks"
                    type="search"
                    value={remarksSearch}
                    onChange={(e) => setRemarksSearch(e.target.value)}
                  />
                </th>
              </tr>
              <tr className="text-center">
                <th>Date</th>
                <th>BillNo</th>
                <th>Customer</th>
                <th>Bag Quantity</th>
                <th>Kg Quantity</th>
                <th>Category</th>
                <th>Description</th>
                <th>Subtotal</th>
                <th>Total Amount</th>
                <th>Cash Received</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">No Sales: {startDate ? format(startDate, 'dd/MMM/yyyy') : ''} {endDate ? '-' : ''}  {endDate ? format(endDate, 'dd/MMM/yyyy') : ''}</td>
                </tr>
              ) : (
                filteredSales.map((sale) =>
                  sale.cartItems.map((item, index) => (
                    <tr key={`${sale._id}-${index}`} style={{ cursor: 'pointer' }} onClick={() => handleSaleReceipt(sale)}>
                      {index === 0 && (
                        <>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            {format(sale.createdAt, 'dd/MM/yy hh:mm a')}
                          </td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            {sale.billNo}
                          </td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            {sale.customerName}
                          </td>
                        </>
                      )}
                      <td className="centered-cell">{item.bagQuantity}</td>
                      <td className="centered-cell">{item.kgQuantity % 1 === 0 ? item.kgQuantity : parseFloat(item.kgQuantity).toFixed(3)}</td>
                      <td className="centered-cell">{item.category}</td>
                      <td className="centered-cell">{item.description}</td>
                      <td className="centered-cell">{item.subTotal.toLocaleString()}</td>
                      {index === 0 && (
                        <>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.total.toLocaleString()}</td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.cashReceived.toLocaleString()}</td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.remarks}</td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            <Button color="info" size="sm" onClick={(event) => handleReturnSale(sale, event)} disabled={sale.returned}>Return</Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )
              )}
            </tbody>
          </Table>

          <div className="mt-4">
            <h6>Sales Report:<strong> {startDate ? format(startDate, 'dd/MMM/yyyy') : ''} {endDate ? '-' : ''}  {endDate ? format(endDate, 'dd/MMM/yyyy') : ''}</strong></h6>

            <ul>
              <li><strong>Total Sales:</strong> {totalSales}</li>
              <li><strong>Total Quantity Sold:</strong> {totalBags} Bags, {totalKgs} Kg</li>
              <li><strong>Total Subtotal:</strong> {totalSubTotal.toLocaleString()} Rs</li>
              <li><strong>Total Sale Amount:</strong> {totalAmount.toLocaleString()} Rs</li>
              <li><strong>Total Cash Sale:</strong> {totalCashSale.toLocaleString()} Rs</li>
              <li><strong>Total Cash Received:</strong> {totalCashReceived.toLocaleString()} Rs</li>
            </ul>
          </div>
        </CardBody>
      </Card>
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>Confirm Return</ModalHeader>
        <ModalBody>
          <div style={{ whiteSpace: 'pre-wrap' }}>{message}</div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmReturn}>Return</Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Sales;
