'use client';
import React, { useState } from 'react';
import { Row, Col, Button, Form, FormGroup, Label, Input, Card, CardTitle, CardBody, Spinner } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateItem = () => {
  const [itemData, setItemData] = useState({
    category: '',
    description: '',
    bagQuantity: 0,
    kgQuantity: 0.0,
    sellRate: 0,
    stockLimit: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setItemData({ ...itemData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!itemData.category || !itemData.description) {
      toast.error('Missing Category or Description.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        toast.success('Item created successfully!');
        // Reset the form
        setItemData({
          category: '',
          description: '',
          bagQuantity: 0,
          kgQuantity: 0.0,
          sellRate: 0,
          stockLimit: 0,
        });
      } else {
        const result = await response.json();
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Error creating item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
          Create New Item
        </CardTitle>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="category">Item Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={itemData.category}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={itemData.description}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="bagQuantity">Bags</Label>
                  <Input
                    id="bagQuantity"
                    name="bagQuantity"
                    type="number"
                    min="0"
                    value={itemData.bagQuantity}
                    onChange={handleChange}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="kgQuantity">Kg</Label>
                  <Input
                    id="kgQuantity"
                    name="kgQuantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemData.kgQuantity}
                    onChange={handleChange}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="sellRate">Bag Rate (25Kg)</Label>
                  <Input
                    id="sellRate"
                    name="sellRate"
                    type="number"
                    min="0"
                    value={itemData.sellRate}
                    onChange={handleChange}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="stockLimit">Stock Limit</Label>
                  <Input
                    id="stockLimit"
                    name="stockLimit"
                    type="number"
                    min="0"
                    value={itemData.stockLimit}
                    onChange={handleChange}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <Button style={{ marginTop: '32px' }} type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Create Item'}
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default CreateItem;
