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
  const [bagRate, setBagRate] = useState(0);
  const [perKgRate, setPerKgRate] = useState(0);
  const [bagStock, setBagStock] = useState(0);
  const [kgStock, setKgStock] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cashReceived, setCashReceived] = useState(''); // New state for cash received
  const [cashReturned, setCashReturned] = useState(0); // State for cash returned
  const [accountType, setaccountType] = useState('cash');

  const fetchRate = async () => {
    try {
      if (selectedCategory && selectedDescription) {
        const response = await fetch(`/api/items/rate?category=${selectedCategory}&description=${selectedDescription.value}`);
        const data = await response.json();
        setBagRate(data.rate)
        setBagStock(data.bag);
        setKgStock(data.kg);
      } else {
        // Clear the rates and stocks when no category or description is selected
        setBagRate(0);
        setPerKgRate(0);
        setBagStock(0);
        setKgStock(0);
      }
    } catch (error) {
      console.error('Error fetching rate:', error);
    }
  };
  useEffect(() => {
    fetchRate();
  }, [selectedCategory, selectedDescription]);

  // Function to fetch account types from the API
  const fetchAccountType = async (accountName) => {
    try {
      const response = await fetch(`/api/accounts?accountName=${accountName}`);
      const data = await response.json();
      if (data.length > 0) {
        return data[0].accountType;
      } else {
        return '';
      }
    } catch (error) {
      console.error('Error fetching account type:', error);
      return '';
    }
  };

  // Event handlers
  const handleNameChange = async (selectedOption) => {
    setSelectedName(selectedOption);
    const accountType = await fetchAccountType(selectedOption.value);
    setaccountType(accountType);
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
    // Update the bagRate state when the user edits the field
    setBagRate(parseFloat(e.target.value));
  };
  const handleperKgRateChange = (e) => {
    // Update the bagRate state when the user edits the field
    setBagRate(parseFloat(e.target.value) * 25);
    setPerKgRate(parseFloat(e.target.value));
  };
  const handleReloadRate = () => {
    fetchRate(); // Re-fetch rate
  };

  const handleAddToCart = () => {
    const bagQuantity = parseInt(document.getElementById('bagQuantity').value) || 0;
    const kgQuantity = parseInt(document.getElementById('kgQuantity').value) || 0;
    if (!selectedCategory || !selectedDescription) {
      alert("Please Select Item");
      return;
    }
    if (bagQuantity === 0 && kgQuantity === 0) {
      alert("Please enter a valid quantity (Bag or Kg) for the item.");
      return;
    }
    const newItem = {
      customerName: selectedName.value,
      category: selectedCategory,
      description: selectedDescription.value,
      bagRate: bagRate,
      perKgRate: bagRate / 25,
      // Show only non-zero quantities in a formatted string
      bagQuantity: `${bagQuantity > 0 ? `${bagQuantity}` : ''}`,
      kgQuantity: `${kgQuantity > 0 ? `${kgQuantity}` : ''}`,
      subtotal: (bagRate * bagQuantity) + ((bagRate / 25) * kgQuantity),
    };
    setCartItems([...cartItems, newItem]); // Add new item to cart state
    // Clear quantity inputs after adding to cart
    setSelectedDescription(null);
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
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.category} - {item.description}</td>
              <td>
                {item.bagQuantity > 0 ? `${item.bagQuantity} Bag` : ''}
                {item.bagQuantity && item.kgQuantity > 0 ? `, ` : ''}
                {item.kgQuantity > 0 ? `${item.kgQuantity} Kg` : ''}
              </td>
              <td>{item.bagRate}</td>
              <td>{item.perKgRate}</td>
              <td>{item.subtotal}</td>
              <td>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                  // Remove item from cart
                  setCartItems((prevCart) => prevCart.filter((_, i) => i !== index));
                  setCashReceived('')
                  setCashReturned(0)
                }}>
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
  const handleCashReceivedChange = (e) => {
    const received = parseFloat(e.target.value) || 0;
    if (calculateTotal() === 0) {
      setCashReceived('')
      setCashReturned(0)
    }
    else {
      setCashReceived(received); // Update cash received
      setCashReturned(received - calculateTotal()); // Calculate cash returned
    }
  };
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
                  <span> </span>
                  <i className="bi bi-arrow-clockwise" onClick={handleReloadRate} style={{ cursor: 'pointer' }}></i>
                  <Input id="rate" name="rate" type="number" min="0" value={bagRate} onChange={handleRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="perKgRate">Kg Rate</Label>
                  <Input id="perKgRate" name="perKgRate" type="number" min="0" value={bagRate / 25} onChange={handleperKgRateChange} />
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
                  <Button color="primary" style={{ marginTop: '32px' }} onClick={handleAddToCart}>
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
                  <Label for="cashReceived">Cash Received</Label>
                  <Input id="cashReceived" name="cashReceived" type="number" min="0" value={cashReceived} onChange={handleCashReceivedChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="cashReturned">Cash Returned</Label>
                  <Input
                    style={{
                      backgroundColor: cashReturned < 0 ? 'rgb(246 78 96)' : '#47bc47',
                      color: 'white'
                    }}
                    id="cashReturned" name="cashReturned" type="number" disabled value={cashReturned} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
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