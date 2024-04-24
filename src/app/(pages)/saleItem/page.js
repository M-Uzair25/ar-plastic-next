'use client'
import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, FormGroup, Label, Input, Card, CardTitle, CardBody, Table } from 'reactstrap';
import CustomerName from '@/components/saleItem/CustomerName';
import ItemCategory from '@/components/saleItem/ItemCategory';
import ItemDescription from '@/components/saleItem/ItemDescription';

const SaleItem = () => {
  const [selectedName, setSelectedName] = useState({ value: 'Cash', label: 'Cash', });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [itemRate, setItemRate] = useState(0); // New state for the fetched rate
  const [kgRate, setkgRate] = useState(0); // New state for the fetched rate
  const [bagStock, setBagStock] = useState(0);
  const [kgStock, setKgStock] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  // useEffect to fetch rate when category or description changes
  const fetchRate = async () => {
    try {
      if (selectedCategory && selectedDescription) {
        const response = await fetch(`/api/items/rate?category=${selectedCategory}&description=${selectedDescription.value}`);
        const data = await response.json();
        setItemRate(data.rate)
        setBagStock(data.bag);
        setKgStock(data.kg);
      } else {
        // Clear the rate when either selectedCategory or selectedDescription is empty
        setItemRate(0);
        setkgRate(0);
        setBagStock(0);
        setKgStock(0);
      }
    } catch (error) {
      console.error('Error fetching rate:', error);
      // Handle error, e.g., show a notification to the user
    }
  };
  useEffect(() => {
    fetchRate();
  }, [selectedCategory, selectedDescription]);

  const handleNameChange = (selectedOption) => {
    // Update state in the parent component with the selected value from the child
    setSelectedName(selectedOption);
  };
  const handleCategoryChange = (selectedOption) => {
    // Update state in the parent component with the selected value from the child
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  };
  const handleDescriptionChange = async (selectedOption) => {
    // Update state in the parent component with the selected value from the child
    setSelectedDescription(selectedOption);
  };
  const handleRateChange = (e) => {
    // Update the itemRate state when the user edits the field
    setItemRate(parseFloat(e.target.value));
  };
  const handleKgRateChange = (e) => {
    // Update the itemRate state when the user edits the field
    setItemRate(parseFloat(e.target.value) * 25);
    setkgRate(parseFloat(e.target.value));
  };
  const handleReloadRate = () => {
    fetchRate();
  };
  const handleAddToCart = () => {
    const bagQuantity = parseInt(document.getElementById('bagQuantity').value) || 0;
    const kgQuantity = parseInt(document.getElementById('kgQuantity').value) || 0;
    if (bagQuantity == 0 && kgQuantity == 0) {
      alert("Please enter a valid quantity (Bag or Kg) for the item.");
      return;
    }
    const newItem = {
      customerName: selectedName.value,
      category: selectedCategory,
      description: selectedDescription.value,
      bagRate: itemRate,
      kgRate: itemRate / 25,
      // Show only non-zero quantities in a formatted string
      bagQuantity: `${bagQuantity > 0 ? `${bagQuantity}` : ''}`,
      kgQuantity: `${kgQuantity > 0 ? `${kgQuantity}` : ''}`,
      subtotal: (itemRate * bagQuantity) + ((itemRate / 25) * kgQuantity),
    };
    setCartItems([...cartItems, newItem]); // Add new item to cart state
    // Clear quantity inputs after adding to cart
    document.getElementById('bagQuantity').value = '';
    document.getElementById('kgQuantity').value = '';
  };

  const displayCartItems = () => {
    return (
      <Table bordered hover className="table-primary">
        <thead>
          <tr>
            <th className="table-secondary">Sr. No.</th>
            <th colSpan="6" className="table-dark">Cash</th>
          </tr>
          <tr>
            <th>Sr.</th>
            <th>Item</th>
            <th>Quantity (Bags, Kg)</th>
            <th>Bag Rate</th>
            <th>Kg Rate</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, index) => (
            <tr key={item.description}>
              <td>{index + 1}</td>
              <td>{item.category} - {item.description}</td>
              <td>
                {item.bagQuantity > 0 ? `${item.bagQuantity} Bag` : ''}
                {item.bagQuantity && item.kgQuantity > 0 ? `, ` : ''}
                {item.kgQuantity > 0 ? `${item.kgQuantity} Kg` : ''}
              </td>
              <td>{item.bagRate}</td>
              <td>{item.kgRate}</td>
              <td>{item.subtotal}</td>
              <td>
                <button type="button" className="btn btn-danger btn-sm">
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
  const calculateTotal = () => {
    const total = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
    return total;
  }
  return (
    <>
      <CardTitle tag="h6" className="border-bottom p-3 mb-2"
        style={{ backgroundColor: '#343a40', color: 'white' }}>
        <i className="me-2"> </i>
        Sale Item
      </CardTitle>
      <Card>
        <CardBody>
          <Form>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="customerName">
                    Customer Name
                  </Label>
                  <CustomerName onNameChange={handleNameChange} />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup>
                  <Label for="note">
                    Note
                  </Label>
                  <Input
                    id="note"
                    name="note"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="category">
                    Item Category
                  </Label>
                  {/* Pass selectedDescription and handleCategoryChange to ItemCategory component */}
                  <ItemCategory onCategoryChange={handleCategoryChange} selectedDescription={selectedDescription} />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label for="description">
                    Description
                  </Label>
                  {/* Pass selectedCategory and handleDescriptionChange to ItemDescription component */}
                  <ItemDescription onDescriptionChange={handleDescriptionChange} selectedCategory={selectedCategory} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="rate">Bag Rate</Label>
                  <Input id="rate" name="rate" type="number" min="0" value={itemRate} onChange={handleRateChange} />
                  <i className="bi bi-arrow-clockwise" onClick={handleReloadRate} style={{ cursor: 'pointer' }}>Reload Rate</i>
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="kgRate">Kg Rate</Label>
                  <Input id="kgRate" name="kgRate" type="number" min="0" value={itemRate / 25} onChange={handleKgRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="bagQuantity">
                    Bags
                  </Label>
                  <Input id="bagQuantity" name="bagQuantity" placeholder={`Stock: ${bagStock}`} type="number" min="0" onClick={(e) => e.target.select()} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="kgQuantity">
                    Kg
                  </Label>
                  <Input id="kgQuantity" name="kgQuantity" placeholder={`Stock: ${kgStock}`} type="number" min="0" onClick={(e) => e.target.select()} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <br />
                  <Button color="primary" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                </FormGroup>
              </Col>
              {/* Display cart items below the Add to Cart button */}
              {cartItems.length > 0 && displayCartItems()}
            </Row>

            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="total">Total</Label>
                  <Input className="bg-danger text-white" id="total" name="total" type="text" disabled value={calculateTotal()} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="cashReceived">
                    Cash Received
                  </Label>
                  <Input id="cashReceived" name="cashReceived" type="number" min="0" />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="cashReturned">
                    Cash Returned
                  </Label>
                  <Input id="cashReturned" name="cashReturned" type="number" min="0" defaultValue="0" />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="payment">
                    Payment Method
                  </Label>
                  <Input id="payment" name="payment" type="select" >
                    <option>
                      Cash
                    </option>
                    <option>
                      Bank Account
                    </option>
                    <option>
                      Khata
                    </option>
                    <option>
                      Dasti
                    </option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="status">
                    Status
                  </Label>
                  <Input id="status" name="status" type="select" >
                    <option>
                      Paid
                    </option>
                    <option>
                      Unpaid
                    </option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <Button color="primary">
              Submit
            </Button>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default SaleItem;