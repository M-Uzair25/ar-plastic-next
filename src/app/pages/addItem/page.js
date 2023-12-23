'use client'
import React, { useState, useEffect  } from 'react';
import { Navbar, Row, Col, NavbarBrand, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import axios from 'axios';
import { useRouter } from 'next/navigation'

const AddItem = () => {
  const router = useRouter()
  const [itemData, setItemData] = useState({
    itemCategory: '',
    itemSubcategory: '',
    color: 'Natural',
    number: 1,
    bagQuantity: 0,
    kgQuantity: 0,
  });
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  useEffect(() => {
    if(itemData.itemCategory.length > 0 && itemData.itemSubcategory.length > 0 ) {
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
    <>
      <Navbar className="mb-4" color="secondary" dark>
        <NavbarBrand>Add New Item</NavbarBrand>
      </Navbar>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={3}>
            <FormGroup>
              <Label for="itemCategory">Item Category</Label>
              <Input id="itemCategory" name="itemCategory" value={itemData.itemCategory} onChange={handleChange} />
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup>
              <Label for="itemSubcategory">Item Sub-Category</Label>
              <Input
                id="itemSubcategory"
                name="itemSubcategory"
                value={itemData.itemSubcategory} onChange={handleChange}
              />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="color">
                Color
              </Label>
              <Input
                id="color"
                name="color"
                value={itemData.color} onChange={handleChange}
              />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label for="Number">
                Number
              </Label>
              <Input id="number" name="number" type="number" min="1" value={itemData.number} onChange={handleChange} />
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
                value={itemData.bagQuantity} onChange={handleChange}
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
                value={itemData.kgQuantity} onChange={handleChange}
              />
            </FormGroup>
          </Col>
        </Row>
        <Button type="submit" disabled={buttonDisabled}>Add Item</Button>
      </Form>
    </>
  );
};

export default AddItem;
