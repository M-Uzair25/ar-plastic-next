'use client'
import { useState, useEffect } from 'react';
import { Row, Col, Table, Card, CardTitle, CardBody, Button, Input, InputGroup, InputGroupText } from "reactstrap";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Handle search and date range change
  const handleSearch = () => {
    fetchSales(fromDate, toDate, searchQuery);
  };

  // Automatically fetch sales again when the search query is cleared
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query === '') {
      fetchSales(fromDate, toDate, ''); // Re-fetch sales when the search query is cleared
    }
  };

  const handleDeleteSale = async (sale) => {
    let itemList = "";

    for (const item of sale.cartItems) {
      const formattedQuantity = formatQuantity(item.bagQuantity, item.kgQuantity);
      itemList += `${formattedQuantity} ${item.category} ${item.description}, `;
    }
    itemList = itemList.slice(0, -2); // Remove trailing comma and space

    const message = `Delete: ${sale.customerName}\nItems: ${itemList}\nTotal Amount: ${sale.total}`;

    if (window.confirm(message)) {
      try {
        const response = await fetch(`/api/sales?id=${sale._id}`, {
          method: 'DELETE',
        });

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

  const formatQuantity = (bagQuantity, kgQuantity) => {
    if (bagQuantity && kgQuantity) {
      return `${bagQuantity} Bag, ${kgQuantity} Kg`;
    } else if (bagQuantity) {
      return `${bagQuantity} Bag`;
    } else if (kgQuantity) {
      return `${kgQuantity} Kg`;
    } else {
      return '';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'dd/MM/yy'); // Custom format
    const formattedTime = format(date, 'hh:mm a'); // Time format
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <Row>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-card-text me-2"> </i>
            Sales {formatDateTime(new Date())}
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
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Search on Enter
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
                    <Button color="info" onClick={handleSearch}>
                      Search
                    </Button>
                    <Button className='mx-2' color="info">
                      Print
                    </Button>
                  </InputGroupText>
                </Col>
              </InputGroup>
            </Row>
            <Table bordered hover dark responsive className="mt-3">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Item Category</th>
                  <th>Item Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Comments</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  sale.cartItems.map((item, index) => (
                    <tr key={`${sale._id}-${index}`}>
                      {index === 0 && (
                        <>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            {formatDateTime(sale.createdAt)}
                          </td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            {sale.customerName}
                          </td>
                        </>
                      )}
                      <td className="centered-cell">{formatQuantity(item.bagQuantity, item.kgQuantity)}</td>
                      <td className="centered-cell">{item.category}</td>
                      <td className="centered-cell">{item.description}</td>
                      {index === 0 && (
                        <>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            {sale.total}
                          </td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            {sale.status}
                          </td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">
                            {sale.note}
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
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Sales;
