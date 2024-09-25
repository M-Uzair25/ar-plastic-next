'use client'
import { Row, Col, Table, Card, CardTitle, CardBody, Label, Button, FormGroup, Input } from "reactstrap";
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [selectedCategory, selectedDescription]);

  return (
    <Row>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-card-text me-2"> </i>
            <strong>Stock: {format(new Date(), 'dd MMM yyyy hh:mm a')}</strong>
          </CardTitle>
          <CardBody>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="category">Item Category</Label>
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
                <Button className='mx-5 mt-4' color="info" onClick={fetchStock}>
                  Search
                </Button>
                <Button className='mx-5 mt-4' color="info">
                  Download PDF
                </Button>
              </Col>
            </Row>

            {/* Stock Table */}
            {loading ? (
              <p>Loading stock data...</p>
            ) : stockData.length > 0 ? (
              <Table bordered>
                <thead>
                  <tr>
                    <th>Item Category</th>
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
                      <td>{`${item.bagQuantity} Bags, ${item.kgQuantity} Kg`}</td>
                      <td>{format(new Date(item.updatedAt), 'dd/MM/yyyy hh:mm a')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No stock data found</p>
            )}

            <div className="mt-4">
              <h6>Stock Report:<strong> {format(new Date(), 'dd/MMM/yyyy')}</strong></h6>

              <ul>
                <li><strong>Total Items:</strong> {stockData.length}</li>
                <li><strong>Total Quantity:</strong> {/* Logic to sum up total quantity */}</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Stock;
