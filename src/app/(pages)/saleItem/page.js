'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Row, Col, Button, Form, FormGroup, Label, Input, Card, CardTitle, CardBody, Table, Spinner } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles
import Accounts from '@/components/Accounts';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';

const SaleItem = () => {
  const defaultCustomerName = { value: 'Cash', label: 'Cash' };
  const [selectedName, setSelectedName] = useState(defaultCustomerName);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [bagRate, setBagRate] = useState(0);
  const [perKgRate, setPerKgRate] = useState(0);
  const [bagStock, setBagStock] = useState(0);
  const [kgStock, setKgStock] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cashPaid, setCashPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [cashReturned, setCashReturned] = useState(0);
  const [bagQuantity, setBagQuantity] = useState('');
  const [kgQuantity, setKgQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Add submitting state for form submission

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDescription, setAccountDescription] = useState('');
  const [accountAmount, setAccountAmount] = useState('');

  // Fetch rate and stock data based on category and description
  const fetchRate = useCallback(async () => {
    if (selectedCategory && selectedDescription) {
      setLoading(true); // Show loading spinner while fetching rates
      try {
        const response = await fetch(`/api/items?category=${selectedCategory}&description=${selectedDescription.value}`);
        const data = await response.json();
        setBagRate(data.rate);
        setPerKgRate(data.rate / 25);
        setBagStock(data.bag);
        setKgStock(data.kg);
        toast.success('Rate fetched successfully!');
      } catch (error) {
        console.error('Error fetching rate:', error);
        toast.error('Error fetching rate.');
      } finally {
        setLoading(false); // Hide loading spinner
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

  const handleNameChange = async (selectedOption) => {
    setSelectedName(selectedOption);
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  };

  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
    setBagQuantity('');
    setKgQuantity('');
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
  };

  const handleRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    setPerKgRate(rate / 25);
    setBagRate(rate);
  };

  const handlePerKgRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    setBagRate(rate * 25);
    setPerKgRate(rate);
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

    if (!selectedName) {
      toast.error("Please Select Customer Name");
      return;
    }
    else if (!selectedCategory || !selectedDescription) {
      toast.error("Please Select Item");
      return;
    }
    else if (bagQty === 0 && kgQty === 0) {
      toast.error("Please enter a valid quantity (Bag or Kg) for the item.");
      return;
    }
    else if (bagQty > bagStock) {
      setBagQuantity('');
      toast.error("Bag stock is not enough.");
      return;
    }
    else if (bagStock === 0 && kgQty > kgStock) {
      setKgQuantity('');
      toast.error("Kg quantity is invalid | Not enough quantity in stock.");
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
    setSelectedDescription(null);
    setBagQuantity('');
    setKgQuantity('');
    toast.success("Item added to cart!");
  };

  const handleCashPaidChange = (e) => {
    setCashPaid(e.target.value);
  };

  const handleDiscountChange = (e) => {
    setDiscount(e.target.value);
  };

  const handleCashReceivedChange = (e) => {
    const received = parseFloat(e.target.value);
    setCashReceived(received);
    setCashReturned(received - total);
  };

  // Recalculate the total whenever the cartItems change
  useEffect(() => {
    const newTotal = cartItems.reduce((acc, item) => acc + item.subTotal, 0);
    setTotal(newTotal);
  }, [cartItems]);

  const displayCartItems = useMemo(() => (
    <Table bordered hover className="table-primary">
      <thead>
        <tr>
          <th colSpan="7" className="table-dark text-center">{selectedName?.label ? selectedName.label : 'No Account Selected'}</th>
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
                setCashPaid('');
                setCashReceived('');
                setCashReturned(0);
                toast.info("Item removed from cart");
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

    if (!selectedName) {
      toast.error("Please Select Customer Name");
      return;
    }
    else if (!cartItems || cartItems.length === 0) {
      toast.error("Cart is empty. Please add items to the cart before submitting.");
      return;
    }

    setSubmitting(true);

    // Set cashPaid to total if it's empty
    const finalCashPaid = cashPaid === '' ? total - discount : cashPaid;

    const saleData = {
      customerName: selectedName.value,
      remarks,
      cartItems,
      total,
      cashPaid: finalCashPaid,
      selectedAccount: selectedAccount ? selectedAccount.value : '',
      accountAmount: accountAmount ? accountAmount : 0,
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
        toast.success('Sale submitted successfully');
        setCartItems([]);
        setSelectedName(defaultCustomerName);
        setCashPaid('');
        setDiscount('');
        setCashReceived('');
        setCashReturned(0);
        setRemarks('');
      } else {
        toast.error(`Error submitting sale: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting sale:', error);
      toast.error(`Error submitting sale: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccountChange = async (selectedOption) => {
    setSelectedAccount(selectedOption);
  };

  const handleAccountPaymentSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      toast.error("Please Select Account");
      return;
    }
    else if (!accountAmount || accountAmount.length === 0) {
      toast.error("Please enter credit amount.");
      return;
    }
    else if (!cartItems || cartItems.length === 0) {
      toast.error("Cart is empty. Please add items to the cart before submitting.");
      return;
    }

    setSubmitting(true);

    // Submit Sale first
    await handleSubmit(e);

    const creditAmount = parseInt(accountAmount);

    const paymentData = {
      party: selectedAccount.value,
      description: accountDescription ? accountDescription : `${cartItems[0].category} Sale`,
      debit: 0,
      credit: creditAmount,
      balance: 0,
    };

    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Account payment submitted successfully');
        setSelectedAccount(null);
        setAccountDescription('');
        setAccountAmount('');
      } else {
        toast.error(`Error submitting account payment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting account payment:', error);
      toast.error(`Error submitting account payment: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
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
                  <Accounts onNameChange={handleNameChange} selectedName={selectedName} />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup>
                  <Label for="remarks">Remarks</Label>
                  <Input id="remarks" name="remarks" value={remarks} onChange={handleRemarksChange} />
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
                  <i className="bi bi-arrow-clockwise" onClick={fetchRate} style={{ cursor: 'pointer' }}></i>
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
                    {loading ? <Spinner size="sm" /> : 'Add to Cart'} {/* Loading spinner when adding */}
                  </Button>
                </FormGroup>
              </Col>
              {cartItems.length > 0 && displayCartItems}
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="total"><strong>Total</strong></Label>
                  <Input className="bg-danger text-white" id="total" name="total" type="text" disabled value={total} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="cashPaid">Cash Paid</Label>
                  <Input id="cashPaid" name="cashPaid" type="number" min="0" value={cashPaid} onChange={handleCashPaidChange} />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Button style={{ marginTop: '32px' }} color="primary" type="submit" disabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : 'Submit'} {/* Show spinner when submitting */}
                  </Button>
                </FormGroup>
              </Col>
              <Col md={1}>
                <FormGroup>
                  <Label for="discount">Discount</Label>
                  <Input id="discount" name="discount" placeholder='0' type="number" min="0" value={discount} onChange={handleDiscountChange} />
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
          </Form>
        </CardBody>
      </Card>

      {/* Account Payment Form */}
      <Card>
        <CardBody>
          <Form onSubmit={handleAccountPaymentSubmit}>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label for="account">Account Name</Label>
                  <Accounts onNameChange={handleAccountChange} selectedName={selectedAccount} />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="accountDescription">Description</Label>
                  <Input id="accountDescription" name="accountDescription" value={accountDescription} onChange={(e) => setAccountDescription(e.target.value)} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="accountAmount">Amount Credit</Label>
                  <Input id="accountAmount" name="accountAmount" type="number" min="0" value={accountAmount} onChange={(e) => setAccountAmount(e.target.value)} />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Button style={{ marginTop: '32px' }} color="primary" type="submit" disabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : 'Submit Payment'} {/* Show spinner when submitting */}
                  </Button>
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
