'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Row, Col, Button, Form, FormGroup, Label, Input, Card, CardTitle, CardBody, Table } from 'reactstrap';
import CustomerName from '@/components/saleItem/CustomerName';
import ItemCategory from '@/components/saleItem/ItemCategory';
import ItemDescription from '@/components/saleItem/ItemDescription';

const SaleItem = () => {
  const defaultCustomerName = { value: 'Cash', label: 'Cash' };
  const [selectedName, setSelectedName] = useState(defaultCustomerName);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [bagRate, setBagRate] = useState(0);
  const [perKgRate, setPerKgRate] = useState(0);
  const [bagStock, setBagStock] = useState(0);
  const [kgStock, setKgStock] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [nameDisabled, setNameDisabled] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [cashReturned, setCashReturned] = useState(0);
  const [accountType, setAccountType] = useState('cash');
  const [bagQuantity, setBagQuantity] = useState('');
  const [kgQuantity, setKgQuantity] = useState('');

  const fetchRate = useCallback(async () => {
    if (selectedCategory && selectedDescription) {
      try {
        const response = await fetch(`/api/items/rate?category=${selectedCategory}&description=${selectedDescription.value}`);
        const data = await response.json();
        setBagRate(data.rate);
        setPerKgRate(data.rate / 25);
        setBagStock(data.bag);
        setKgStock(data.kg);
      } catch (error) {
        console.error('Error fetching rate:', error);
      }
    } else {
      setBagRate(0);
      setPerKgRate(0);
      setBagStock(0);
      setKgStock(0);
    }
  }, [selectedCategory, selectedDescription]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const fetchAccountType = useCallback(async (accountName) => {
    try {
      const response = await fetch(`/api/accounts?accountName=${accountName}`);
      const data = await response.json();
      return data.length > 0 ? data[0].accountType : '';
    } catch (error) {
      console.error('Error fetching account type:', error);
      return '';
    }
  }, []);

  const handleNameChange = async (selectedOption) => {
    setSelectedName(selectedOption);
    const accountType = await fetchAccountType(selectedOption.value);
    setAccountType(accountType);
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  };

  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
  };

  const handleRateChange = (e) => {
    setBagRate(parseFloat(e.target.value));
  };

  const handlePerKgRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    setBagRate(rate * 25);
    setPerKgRate(rate);
  };

  const handleReloadRate = () => {
    fetchRate();
  };

  const handleBagQuantityChange = (e) => {
    setBagQuantity(e.target.value);
  };

  const handleKgQuantityChange = (e) => {
    setKgQuantity(e.target.value);
  };


  const handleAddToCart = () => {
    const bagQty = parseInt(bagQuantity) || 0;
    const kgQty = parseInt(kgQuantity) || 0;

    if (!selectedCategory || !selectedDescription) {
      alert("Please Select Item");
      return;
    }
    if (bagQty === 0 && kgQty === 0) {
      alert("Please enter a valid quantity (Bag or Kg) for the item.");
      return;
    }
    if (bagQty > bagStock) {
      setBagQuantity('')
      alert("Bag stock is not enough.");
      return;
    }
    if (bagStock === 0 && kgQty > kgStock) {
      setKgQuantity('')
      alert("Kg quantity is invalid | Not enough quantity in stock.");
      return;
    }

    const newItem = {
      category: selectedCategory,
      description: selectedDescription.value,
      bagRate: bagRate,
      perKgRate: perKgRate,
      bagQuantity: bagQty,
      kgQuantity: kgQty,
      subTotal: (bagRate * bagQty) + (perKgRate * kgQty),
    };

    setCartItems((prevItems) => [...prevItems, newItem]);
    setNameDisabled(true)
    setSelectedDescription(null);
    setBagQuantity('');
    setKgQuantity('');
  };

  const handleCashReceivedChange = (e) => {
    const received = parseFloat(e.target.value);
    setCashReceived(received);
    setCashReturned(received - calculateTotal());
  };

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((acc, item) => acc + item.subTotal, 0);
  }, [cartItems]);

  const displayCartItems = useMemo(() => (
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
          <th>Sub total</th>
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
            <td>{item.subTotal}</td>
            <td>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => {
                setCartItems((prevCart) => prevCart.filter((_, i) => i !== index));
                index === 0 ? setNameDisabled(false) : setNameDisabled(true);
                setCashReceived('');
                setCashReturned(0);
              }}>
                <i className="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ), [cartItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const saleData = {
      customerName: selectedName.value,
      remarks: document.getElementById('remarks').value,
      cartItems,
      total: calculateTotal(),
    };

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Sale submitted successfully');
        // Clear the form or perform any necessary actions
        setCartItems([]);
        setNameDisabled(false)
        setSelectedName(defaultCustomerName);
        setCashReceived('');
        setCashReturned(0);
      } else {
        alert(`Error submitting sale: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting sale:', error);
      alert(`Error submitting sale: ${error.message}`);
    }
  };

  return (
    <>
      <CardTitle tag="h6" className="border-bottom p-3 mb-2" style={{ backgroundColor: '#343a40', color: 'white' }}>
        Sale Item
      </CardTitle>
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="customerName">Customer Name</Label>
                  <CustomerName onNameChange={handleNameChange} selectedName={selectedName} disable={nameDisabled} />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup>
                  <Label for="remarks">Remarks</Label>
                  <Input id="remarks" name="remarks" />
                </FormGroup>
              </Col>
            </Row>
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
                  <Input id="perKgRate" name="perKgRate" type="number" min="0" value={perKgRate} onChange={handlePerKgRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="bagQuantity">Bags</Label>
                  <Input id="bagQuantity" name="bagQuantity" placeholder={`Stock: ${bagStock}`} type="number" min="0" value={bagQuantity} onChange={handleBagQuantityChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="kgQuantity">Kg</Label>
                  <Input id="kgQuantity" name="kgQuantity" placeholder={`Stock: ${kgStock}`} type="number" min="0" value={kgQuantity} onChange={handleKgQuantityChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Button color="primary" style={{ marginTop: '32px' }} onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                </FormGroup>
              </Col>
              {cartItems.length > 0 && displayCartItems}
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="total"><strong>Total</strong></Label>
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
              <Col>
                <FormGroup>
                  <Button style={{ marginTop: '32px' }} color="primary" type="submit">Submit</Button>
                </FormGroup>
              </Col>
            </Row>

          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default SaleItem;
