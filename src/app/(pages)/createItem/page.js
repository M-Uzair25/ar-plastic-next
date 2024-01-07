'use client'
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, FormGroup, Label, Input, Card, CardTitle, CardBody } from 'reactstrap';
import axios from 'axios';
import { useRouter } from 'next/navigation'

const CreateItem = () => {
  const router = useRouter()
  const [itemData, setItemData] = useState({
    category: '',
    description: '',
    bagQuantity: 0,
    kgQuantity: 0,
    sellRate: 0,
  });
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  useEffect(() => {
    if (itemData.category.length > 0 && itemData.description.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [itemData]);

  const handleChange = (event) => {
    setItemData({ ...itemData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/items', itemData);
      console.log('Item created successfully:', response.data);
      router.push('/');
      // Display success message to the user
    } catch (error) {
      console.error('Error creating item:', error);
      // Display error message to the user
    }
  };
  return (
    <Card>
      <CardTitle tag="h6" className="border-bottom p-3 mb-0"
        style={{ backgroundColor: '#343a40', color: 'white' }}>
        <i className="me-2"> </i>
        Create New Item
      </CardTitle>
      <CardBody>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={2}>
              <FormGroup>
                <Label for="category">Item Category</Label>
                <Input id="category" name="category" value={itemData.category} onChange={handleChange} />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={itemData.description} onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col md={1}>
              <FormGroup>
                <Label for="bagQuantity">
                  Bags
                </Label>
                <Input
                  id="bagQuantity"
                  name="bagQuantity"
                  type="number"
                  min="0"
                  value={itemData.bagQuantity} onChange={handleChange} onClick={(e) => e.target.select()}
                />
              </FormGroup>
            </Col>
            <Col md={1}>
              <FormGroup>
                <Label for="kgQuantity">
                  Kg
                </Label>
                <Input
                  id="kgQuantity"
                  name="kgQuantity"
                  type="number"
                  min="0"
                  value={itemData.kgQuantity} onChange={handleChange} onClick={(e) => e.target.select()}
                />
              </FormGroup>
            </Col>
            <Col md={2}>
              <FormGroup>
                <Label for="sellRate">
                  Bag Rate (25Kg)
                </Label>
                <Input
                  id="sellRate"
                  name="sellRate"
                  type="number"
                  min="0"
                  value={itemData.sellRate} onChange={handleChange} onClick={(e) => e.target.select()}
                />
              </FormGroup>
            </Col>
          </Row>
          <Button type="submit" disabled={buttonDisabled}>Create Item</Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default CreateItem;
