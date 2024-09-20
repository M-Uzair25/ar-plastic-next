'use client';
import { useState, useEffect } from 'react';
import { Row, Col, Table, Card, CardTitle, CardBody, Button, Input, InputGroup, InputGroupText } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { generateSalesPDF } from '@/components/sales/generateSalesPDF';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // States for column-specific search inputs
  const [customerSearch, setCustomerSearch] = useState('');
  const [bagQuantitySearch, setBagQuantitySearch] = useState('');
  const [kgQuantitySearch, setKgQuantitySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [subTotalSearch, setSubTotalSearch] = useState('');
  const [amountSearch, setAmountSearch] = useState('');
  const [remarksSearch, setRemarksSearch] = useState('');

  // Function to fetch sales data with optional date range and search filters
  const fetchSales = async (fromDate = '', toDate = '', searchQuery = '') => {
    try {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('fromDate', format(fromDate, 'yyyy-MM-dd'));
      if (toDate) queryParams.append('toDate', format(toDate, 'yyyy-MM-dd'));
      if (searchQuery) queryParams.append('search', searchQuery);

      const response = await fetch(`/api/sales?${queryParams.toString()}`);
      const data = await response.json();
      setSales(data.sales);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  // Fetch default sales data on component mount
  useEffect(() => {
    const today = new Date();
    setFromDate(today);
    fetchSales(today); // Fetch sales for today's date by default
  }, []);

  // Trigger search whenever fromDate, toDate, or searchQuery changes
  useEffect(() => {
    fetchSales(fromDate, toDate, searchQuery);
  }, [fromDate, toDate, searchQuery]);

  // Handle search query input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle print sales
  const handleDownloadPDF = () => {
    generateSalesPDF(sales, fromDate, toDate);
  };

  // Handle deletion of a sale
  const handleDeleteSale = async (sale) => {
    let itemList = sale.cartItems
      .map((item) => `${item.bagQuantity} Bag, ${item.kgQuantity} Kg ${item.category} ${item.description}`)
      .join(', '); // Create a comma-separated list of items

    const message = `Delete: ${sale.customerName}\nItems: ${itemList}\nTotal Amount: ${sale.total}`;

    if (window.confirm(message)) {
      try {
        const response = await fetch(`/api/sales?id=${sale._id}`, { method: 'DELETE' });

        if (response.ok) {
          const deletedSale = await response.json();
          // Update state to remove the deleted sale from the UI
          setSales(sales.filter((sale) => sale._id !== deletedSale._id));
          alert('Sale deleted successfully');
        } else {
          const result = await response.json();
          alert(`Error deleting sale: ${result.message}`);
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Error deleting sale');
      }
    }
  };

  // Filtered sales based on column-specific search inputs
  const filteredSales = sales.filter((sale) =>
    (sale.customerName.toLowerCase().includes(customerSearch.toLowerCase()) || !customerSearch) &&
    sale.cartItems.some((item) =>
      (item.bagQuantity.toString().includes(bagQuantitySearch) || !bagQuantitySearch) &&
      (item.kgQuantity.toString().includes(kgQuantitySearch) || !kgQuantitySearch) &&
      (item.category.toLowerCase().includes(categorySearch.toLowerCase()) || !categorySearch) &&
      (item.description.toLowerCase().includes(descriptionSearch.toLowerCase()) || !descriptionSearch) &&
      (item.subTotal.toString().includes(subTotalSearch) || !subTotalSearch)
    ) &&
    (sale.total.toString().includes(amountSearch) || !amountSearch) &&
    (sale.remarks.toLowerCase().includes(remarksSearch.toLowerCase()) || !remarksSearch)
  );

  // Calculate sales statistics
  const totalSales = filteredSales.length;
  const totalQuantity = filteredSales.reduce(
    (acc, sale) => {
      sale.cartItems.forEach((item) => {
        acc.bags += item.bagQuantity ? parseInt(item.bagQuantity, 10) : 0;
        acc.kgs += item.kgQuantity ? parseInt(item.kgQuantity, 10) : 0;
      });
      return acc;
    },
    { bags: 0, kgs: 0 }
  );

  const totalAmount = filteredSales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <Row>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-card-text me-2"> </i>
            Sales {format(new Date(), 'dd MMM yyyy hh:mm a')}
          </CardTitle>
          <CardBody>
            <Row>
              <InputGroup>
                <Col md={4}>
                  <InputGroupText>
                    <Input
                      id="search"
                      name="search"
                      placeholder="Search"
                      type="search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={(e) => e.key === 'Enter' && fetchSales(fromDate, toDate, searchQuery)} // Search on Enter key
                    />
                  </InputGroupText>
                </Col>
                <Col>
                  <InputGroupText>From:
                    <DatePicker
                      selected={fromDate}
                      onChange={(date) => setFromDate(date)}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                    />
                  </InputGroupText>
                </Col>
                <Col>
                  <InputGroupText>To:
                    <DatePicker
                      selected={toDate}
                      onChange={(date) => setToDate(date)}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                    />
                  </InputGroupText>
                </Col>
                <Col>
                  <InputGroupText>
                    <Button color="info" onClick={() => fetchSales(fromDate, toDate, searchQuery)}>
                      Search
                    </Button>
                    <Button className='mx-2' color="info" onClick={handleDownloadPDF}>
                      Download PDF
                    </Button>
                  </InputGroupText>
                </Col>
              </InputGroup>
            </Row>

            {/* Display selected date range above the table */}
            <Row className="mt-3">
              <Col>
                <h6><strong>{fromDate ? format(fromDate, 'dd MMM yyyy') : ''} {toDate ? ' - ' + format(toDate, 'dd MMM yyyy') : ''}</strong> </h6>
              </Col>
            </Row>

            <Table bordered hover responsive className="table-primary" size="sm">
              <thead>
                <tr className="table-dark">
                  <th className='centered-cell'>
                    Search
                  </th>
                  <th>
                    <Input
                      id="customerSearch"
                      name="customerSearch"
                      placeholder="Customer"
                      type="search"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
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
                    <Input
                      id="categorySearch"
                      name="categorySearch"
                      placeholder="Category"
                      type="search"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </th>
                  <th>
                    <Input
                      id="descriptionSearch"
                      name="descriptionSearch"
                      placeholder="Description"
                      type="search"
                      value={descriptionSearch}
                      onChange={(e) => setDescriptionSearch(e.target.value)}
                    />
                  </th>
                  <th>
                    <Input
                      id="subTotalSearch"
                      name="subTotalSearch"
                      placeholder="subTotal"
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
                      id="remarksSearch"
                      name="remarksSearch"
                      placeholder="Remarks"
                      type="search"
                      value={remarksSearch}
                      onChange={(e) => setRemarksSearch(e.target.value)}
                    />
                  </th>
                </tr>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Bag Quantity</th>
                  <th>Kg Quantity</th>
                  <th>Item Category</th>
                  <th>Item Description</th>
                  <th>Subtotal</th>
                  <th>Bill Amount</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">No Sales: {fromDate ? format(fromDate, 'dd/MMM/yyyy') : ''} {toDate ? '-' : ''}  {toDate ? format(toDate, 'dd/MMM/yyyy') : ''}</td>
                  </tr>
                ) : (
                  filteredSales.map((sale) =>
                    sale.cartItems.map((item, index) => (
                      <tr key={`${sale._id}-${index}`}>
                        {index === 0 && (
                          <>
                            <td rowSpan={sale.cartItems.length} className="centered-cell">
                              {format(sale.createdAt, 'dd/MM/yyyy hh:mm a')}
                            </td>
                            <td rowSpan={sale.cartItems.length} className="centered-cell">
                              {sale.customerName}
                            </td>
                          </>
                        )}
                        <td className="centered-cell">{item.bagQuantity}</td>
                        <td className="centered-cell">{item.kgQuantity}</td>
                        <td className="centered-cell">{item.category}</td>
                        <td className="centered-cell">{item.description}</td>
                        <td className="centered-cell">{item.subTotal}</td>
                        {index === 0 && (
                          <>
                            <td rowSpan={sale.cartItems.length} className="centered-cell">
                              {sale.total}
                            </td>
                            <td rowSpan={sale.cartItems.length} className="centered-cell">
                              {sale.remarks}
                            </td>
                            <td rowSpan={sale.cartItems.length} className="centered-cell">
                              <Button color="danger" size="sm" onClick={() => handleDeleteSale(sale)}>
                                Delete
                              </Button>
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
              <h6>Sales Report:<strong> {fromDate ? format(fromDate, 'dd/MMM/yyyy') : ''} {toDate ? '-' : ''}  {toDate ? format(toDate, 'dd/MMM/yyyy') : ''}</strong></h6>

              <ul>
                <li><strong>Total Sales:</strong> {totalSales}</li>
                <li><strong>Total Quantity Sold:</strong> {totalQuantity.bags} Bags, {totalQuantity.kgs} Kgs</li>
                <li><strong>Total Amount:</strong> {totalAmount.toFixed(0)} Rs</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Sales;
