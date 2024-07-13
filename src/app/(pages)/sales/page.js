'use client'
import { useState, useEffect } from 'react';
import { Row, Col, Table, Card, CardTitle, CardBody, Button, FormGroup, Input, Pagination, PaginationItem, PaginationLink } from "reactstrap";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  const fetchSales = async (page = 1, query = '') => {
    try {
      const response = await fetch(`/api/sales?page=${page}&limit=${itemsPerPage}&search=${query}`);
      const data = await response.json();
      setSales(data.sales);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSales(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchSales(page, searchQuery);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSales(1, e.target.value);
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
              <Col>
                <CardTitle>Filter by:</CardTitle>
              </Col>
              <Col>
                <CardTitle>Save as pdf</CardTitle>
              </Col>
            </Row>
            <Table bordered hover dark responsive>
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
                          <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.status}</td>
                          <td rowSpan={sale.cartItems.length} className="centered-cell">{sale.note}</td>
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
            <Pagination>
              <PaginationItem disabled={currentPage === 1}>
                <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem active={index + 1 === currentPage} key={index}>
                  <PaginationLink onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem disabled={currentPage === totalPages}>
                <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
              </PaginationItem>
            </Pagination>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Sales;
