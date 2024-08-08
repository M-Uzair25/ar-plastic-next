'use client'
import { useState, useEffect } from 'react';
import { Row, Col, Table, Card, CardTitle, CardBody, Button, FormGroup, Input } from "reactstrap";
import '@/styles/pagination.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // One-indexed for user experience
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 1;

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
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    // Reset to the first page and fetch sales
    setCurrentPage(1); // Set to 1 for user experience
    fetchSales(1, newQuery); // Fetch sales for the first page on search
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

  const renderPagination = () => {
    const pages = [];

    if (totalPages <= 5) {
      // If total pages are 5 or less, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always add the first page
      pages.push(1);

      // Add ellipsis if necessary
      if (currentPage > 3) {
        pages.push('...');
      }

      // Add a range of pages around the current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if necessary
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always add the last page
      pages.push(totalPages);
    }

    return pages.map((page, index) => (
      <Button
        key={index}
        active={page === currentPage}
        disabled={page === '...'}
        onClick={() => typeof page === 'number' && handlePageChange(page)}
      >
        {page}
      </Button>
    ));
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
            <div className="pagination">
              <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>← Previous</Button>
              {renderPagination()}
              <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next →</Button>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Sales;
