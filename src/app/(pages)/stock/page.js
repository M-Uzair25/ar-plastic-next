'use client';
import { Row, Col, Table, Card, CardTitle, CardBody, Label, Button, FormGroup, Spinner } from 'reactstrap';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';
import { generateStockPDF } from '@/components/stock/generateStockPDF';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Stock = () => {
  const [stockData, setStockData] = useState([]);  // Store stock data
  const [loading, setLoading] = useState(false);   // Loading state
  const [selectedCategory, setSelectedCategory] = useState(null); // Selected category
  const [selectedDescription, setSelectedDescription] = useState(null); // Selected description

  // Handle category change
  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  };

  // Handle description change
  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
  };

  // Fetch stock data based on selected category and description
  const fetchStock = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (selectedDescription) queryParams.append('description', selectedDescription.value);

      const response = await fetch(`/api/stock?${queryParams.toString()}`);
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error("Error fetching filtered stock:", error);
      toast.error('Failed to load stock data'); // Show error toast
    } finally {
      setLoading(false);
    }
  };

  // Calculate total quantities for the stock report
  const calculateTotalQuantities = () => {
    const totalBags = stockData.reduce((acc, item) => acc + item.bagQuantity, 0);
    const totalKg = stockData.reduce((acc, item) => acc + item.kgQuantity, 0);
    return { totalBags, totalKg };
  };
  const { totalBags, totalKg } = calculateTotalQuantities();

  // Generate PDF
  const handleDownloadStockPDF = () => {
    generateStockPDF(stockData);
    toast.success('PDF downloaded successfully'); // Show success toast
  };

  useEffect(() => {
    fetchStock();
  }, [selectedCategory, selectedDescription]);

  return (
    <>
      <ToastContainer />
      <Row>
        <Col lg="12">
          <Card>
            <CardTitle tag="h6" className="border-bottom p-3 mb-2" style={{ backgroundColor: '#343a40', color: 'white' }}>
              <i className="bi bi-card-text me-2"> </i>
              Stock: {format(new Date(), 'dd MMM yyyy hh:mm a')}
            </CardTitle>
            <CardBody>
              <Row>
                <Col md={2}>
                  <FormGroup>
                    <Label for="category">Category</Label>
                    <ItemCategory onCategoryChange={handleCategoryChange} selectedDescription={selectedDescription} />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <ItemDescription onDescriptionChange={handleDescriptionChange} selectedCategory={selectedCategory} />
                  </FormGroup>
                </Col>
                <Col>
                  <Button className='mx-5' color="info" style={{ marginTop: '32px' }} onClick={handleDownloadStockPDF}>
                    Download PDF
                  </Button>
                </Col>
              </Row>
              {/* Stock Table */}
              {loading ? (
                <div className="text-center">
                  <Spinner color="primary" /> {/* Loading spinner */}
                </div>
              ) : stockData.length > 0 ? (
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Stock</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((item) => (
                      <tr key={item._id}>
                        <td>{item.category}</td>
                        <td>{item.description}</td>
                        <td>
                          <span style={{ color: item.bagQuantity <= item.stockLimit ? 'red' : 'blue', fontWeight: 'bold' }}>
                            {item.bagQuantity} </span>
                          Bags,
                          <span style={{ color: 'blue', fontWeight: 'bold' }}> {item.kgQuantity} </span>
                          Kg
                        </td>
                        <td>{format(new Date(item.updatedAt), 'dd/MM/yyyy hh:mm a')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No stock data found</p>
              )}

              {/* Stock Summary */}
              <div className="mt-4">
                <h6>Stock Report:<strong> {format(new Date(), 'dd/MMM/yyyy')}</strong></h6>
                <ul>
                  <li><strong>Total Items:</strong> {stockData.length}</li>
                  <li><strong>Total Quantity:</strong> {totalBags} Bags, {totalKg} Kg</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Stock;
