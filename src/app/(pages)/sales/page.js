'use client'
import { useState, useEffect } from 'react';
import { Table, Row, Col, Card, CardTitle, CardBody, FormGroup, Input, Button } from 'reactstrap';
import ReactPaginate from 'react-paginate';
import '@/styles/pagination.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSales();
  }, [currentPage, searchQuery]);

  const fetchSales = async () => {
    try {
      const response = await fetch(`/api/sales?page=${currentPage + 1}&search=${searchQuery}`);
      const data = await response.json();
      setSales(data.sales);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
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
          // Update state to remove the deleted sale from the UI
          fetchSales();
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
    const formattedDate = date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
              <Col md={3}>
                <FormGroup>
                  <Input
                    id="search"
                    name="search"
                    placeholder="Search"
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <CardTitle><Input
                  id="exampleDate"
                  name="date"
                  placeholder="date placeholder"
                  type="date"
                /></CardTitle>
              </Col>
              <Col md={2}>
                <CardTitle style={{ color: '#2962ff', cursor: 'pointer', marginTop: '8px' }}>Save as pdf <i className="bi bi-filetype-pdf mt-20"></i></CardTitle>
              </Col>
            </Row>
            {Object.keys(sales).length === 0 ? (
              <p>No results found</p>
            ) : (
              Object.keys(sales).map((date) =>
              (
                <div key={date}>
                  <h5 className="mt-4">{date}</h5>
                  <Table bordered hover dark responsive>
                    <thead>
                      <tr>
                        <th>
                        </th>
                        <th>
                          <Input
                            id="search"
                            name="search"
                            placeholder="Customer"
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                          /></th>
                        <th>
                          <Input
                            id="search"
                            name="search"
                            placeholder="Quantity"
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                          /></th>
                        <th>
                          <Input
                            id="search"
                            name="search"
                            placeholder="Category"
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                          /></th>
                        <th>
                          <Input
                            id="search"
                            name="search"
                            placeholder="Description"
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                          /></th>
                        <th>
                          <Input
                            id="search"
                            name="search"
                            placeholder="Amount"
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                          /></th>
                        <th>
                          <Input id="status" name="status" type="select">
                            <option>All</option>
                            <option>Paid</option>
                            <option>Unpaid</option>
                          </Input>
                        </th>
                        <th>
                          <Input
                            id="search"
                            name="search"
                            placeholder="Comments"
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                          /></th>
                        <th></th>
                      </tr>
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
                      {sales[date].map((sale) => (
                        sale.cartItems.map((item, index) => (
                          <tr key={`${sale._id}-${index}`}>
                            {index === 0 && (
                              <>
                                <td rowSpan={sale.cartItems.length} className="centered-cell" scope="row">{formatDateTime(sale.createdAt)}</td>
                                <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.customerName}</td>
                              </>
                            )}
                            <td className="centered-cell">{formatQuantity(item.bagQuantity, item.kgQuantity)}</td>
                            <td className="centered-cell">{item.category}</td>
                            <td className="centered-cell">{item.description}</td>
                            {index === 0 && (
                              <>
                                <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.total}</td>
                                <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.status} {formatDateTime(sale.updatedAt)}</td>
                                <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.note}</td>
                                <td rowSpan={sale.cartItems.length} className="centered-cell">
                                  <Button color="danger" size="sm" onClick={() => handleDeleteSale(sale)}>
                                    Delete
                                  </Button>
                                  <Button color="success" size="sm" >
                                    Status
                                  </Button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))
            )}
            <ReactPaginate
              previousLabel={'‹'}
              nextLabel={'›'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={totalPages}
              marginPagesDisplayed={1}
              pageRangeDisplayed={2}
              onPageChange={handlePageChange}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Sales;
