'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Row, Col, Button, Badge, Form, FormGroup, Label, Input, Card, CardTitle, CardBody, Table, Spinner,
  Modal, ModalHeader, ModalFooter
} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import Accounts from '@/components/Accounts';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';
import { generateSaleReceipt } from '@/components/pdfReports/generateSaleReceipt';

const SaleItem = () => {
  const defaultCustomerName = { value: 'CASH', label: 'CASH' };
  const [selectedName, setSelectedName] = useState(defaultCustomerName);
  const [balance, setBalance] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [purchasedRate, setPurchasedRate] = useState(0);
  const [bagRate, setBagRate] = useState(0);
  const [perKgRate, setPerKgRate] = useState(0);
  const [bagStock, setBagStock] = useState(0);
  const [kgStock, setKgStock] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [received, setReceived] = useState(0);
  const [returned, setReturned] = useState(0);
  const [bagQuantity, setBagQuantity] = useState(0);
  const [kgQuantity, setKgQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Add submitting state for form submission

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDescription, setAccountDescription] = useState('');
  const [accountAmount, setAccountAmount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const [saleReceiptData, setSaleReceiptData] = useState(null);

  const handleSaleReceipt = () => {
    const date = format(new Date(), 'dd/MM/yyyy hh:mm a');
    generateSaleReceipt(saleReceiptData, date);
    toggleModal();
  };

  // Fetch rate and stock data based on category and description
  const fetchRate = useCallback(async () => {
    if (selectedCategory && selectedDescription) {
      setLoading(true); // Show loading spinner while fetching rates
      try {
        const response = await fetch(`/api/items?category=${selectedCategory.value}&description=${selectedDescription.value}`);
        const data = await response.json();
        setBagRate(data.sellRate);
        setPurchasedRate(data.purchasedRate);
        setPerKgRate(data.sellRate / 25);
        setBagStock(data.bagQuantity);
        setKgStock(data.kgQuantity);
        if (data.bagQuantity < data.stockLimit) {
          toast.info(`Stock running out! Only ${data.bagQuantity} Bags remaining.`);
        }
      } catch (error) {
        console.error('Error fetching rate:', error);
        toast.error('Error fetching rate.');
      } finally {
        setLoading(false); // Hide loading spinner
      }
    } else {
      setBagRate(0);
      setPurchasedRate(0);
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

    if (!selectedOption) {
      setBalance(0);
      return;
    }
    if (selectedOption.value === 'CASH') {
      setBalance('');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/accounts?accountName=${selectedOption.value}`);
      const data = await response.json();

      if (response.ok) {
        setBalance(data.balance);
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error('Error Fetching Balance.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
    setBagQuantity(0);
    setKgQuantity(0);
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
  };

  const handleRateChange = (e) => {
    const rate = parseInt(e.target.value);
    setPerKgRate(rate / 25);
    setBagRate(rate);
  };

  const handlePerKgRateChange = (e) => {
    const rate = parseInt(e.target.value);
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
    if (bagQuantity % 1 !== 0) {
      toast.error("Bag quantity should not be a decimal number.");
      return;
    }

    const bagQty = parseInt(bagQuantity) || 0;
    let kgQty = parseFloat(kgQuantity).toFixed(3) || 0;

    if (!selectedName) {
      toast.error("Please Select Customer Name");
      return;
    }
    if (!selectedCategory || !selectedDescription) {
      toast.error("Please Select Item");
      return;
    }
    if (bagQty == 0 && kgQty == 0) {
      toast.error("Please enter a valid quantity (Bag or Kg) for the item.");
      return;
    }
    if (bagQty > bagStock) {
      setBagQuantity(0);
      toast.error("Bag stock is not enough.");
      return;
    }
    if (bagStock === 0 && kgQty > kgStock) {
      setKgQuantity(0);
      toast.error("Kg quantity is invalid | Not enough quantity in stock.");
      return;
    }
    if (bagRate < purchasedRate) {
      toast.error(`Selling rate is less than purchased rate (${purchasedRate}).`);
      return;
    }

    if (kgQty % 1 === 0) {
      kgQty = parseInt(kgQuantity, 10);
    }

    const newItem = {
      category: selectedCategory.value,
      description: selectedDescription.value,
      bagRate: bagRate,
      perKgRate: perKgRate,
      bagQuantity: bagQty,
      kgQuantity: kgQty,
      subTotal: parseInt((bagRate * bagQty) + (perKgRate * kgQty)),
    };

    setCartItems((prevItems) => [...prevItems, newItem]);
    setSelectedDescription(null);
    setBagQuantity(0);
    setKgQuantity(0);
    toast.success("Item added to cart!");
  };

  const handleCashReceivedChange = (e) => {
    setCashReceived(e.target.value);
  };

  const handleDiscountChange = (e) => {
    setDiscount(e.target.value);
    setCashReceived(total - e.target.value);
  };

  const handleReceivedChange = (e) => {
    setReceived(e.target.value);
    setReturned(e.target.value - total);
  };

  // Recalculate the total whenever the cartItems change
  useEffect(() => {
    const newTotal = cartItems.reduce((acc, item) => acc + item.subTotal, 0);
    setTotal(newTotal);
    if (selectedName.value === 'CASH')
      setCashReceived(newTotal);
  }, [cartItems]);

  const displayCartItems = useMemo(() => (
    <Table bordered hover className="table-primary">
      <thead>
        <tr>
          <th colSpan="7" className="table-dark text-center">
            {selectedName?.label ? selectedName.label : 'No Account Selected'}
          </th>
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
                setCashReceived(0);
                setReceived(0);
                setReturned(0);
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
    if (!cartItems || cartItems.length === 0) {
      toast.error("Cart is empty. Please add items to the cart before submitting.");
      return;
    }
    if (selectedName.value === 'CASH' && (parseInt(cashReceived) + parseInt(accountAmount) < total) && discount === 0) {
      toast.error('Cash received is less than the total amount. Please select an account to transfer the remaining amount');
      return;
    }

    setSubmitting(true);

    const saleData = {
      customerName: selectedName.value,
      remarks,
      cartItems,
      total,
      cashReceived,
      selectedAccount: selectedAccount ? selectedAccount.value : '',
      accountAmount,
      discount,
    };

    try {
      const api = selectedName.value === 'CASH' ? '/api/sales/cashSale' : '/api/sales';
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (parseInt(cashReceived) > 0 && selectedName.value !== 'CASH') {
        handleCashSubmit(e);
      }

      if (response.ok) {
        toast.success('Sale submitted successfully');
        setSaleReceiptData(saleData);
        toggleModal();
        setCartItems([]);
        setSelectedName(defaultCustomerName);
        setCashReceived(0);
        setDiscount(0);
        setReceived(0);
        setReturned(0);
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

  const handleCashSubmit = async (e) => {
    e.preventDefault();

    const receivingData = {
      account: selectedName.value,
      description: 'CASH RECEIVED',
      amount: parseInt(cashReceived),
    };

    try {
      const response = await fetch('/api/receivings/cashReceiving', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receivingData),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error('Error submitting cash.');
    }
  };

  const handleAccountChange = async (selectedOption) => {
    setSelectedAccount(selectedOption);
    setCashReceived(0);
  };

  const handleAccountPaymentSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      toast.error("Please Select Account");
      return;
    }
    if (!accountAmount) {
      toast.error("Please enter credit amount.");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      toast.error("Cart is empty. Please add items to the cart before submitting.");
      return;
    }
    if (selectedName.value === selectedAccount.value) {
      toast.error('Customer and Account name cannot be same.');
      return;
    }

    if (selectedName.value === 'CASH' && (parseInt(cashReceived) + parseInt(accountAmount) < total) && discount === 0) {
      toast.error('Cash received + Credit Amount is less than the total bill amount.');
      return;
    }

    setSubmitting(true);

    // Submit Sale first
    await handleSubmit(e);

    const creditAmount = parseInt(accountAmount);

    const paymentData = {
      name: selectedAccount.value,
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
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Account payment submitted successfully');
        setSelectedAccount(null);
        setAccountDescription('');
        setAccountAmount(0);
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
      <ToastContainer newestOnTop />
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-2" style={{ backgroundColor: '#343a40', color: 'white' }}>
          Sale Item
        </CardTitle>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="customerName">Customer Name</Label>
                  <Badge color="primary" className='mx-4'> Balance  = {balance} Rs</Badge>
                  <Accounts onNameChange={handleNameChange} selectedName={selectedName} apiEndpoint="accountType=cash,customer,supplier" />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup>
                  <Label for="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    name="remarks"
                    type="textarea"
                    bsSize="sm"
                    style={{ height: "38px" }}
                    value={remarks}
                    onChange={handleRemarksChange}
                  />
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
                  <Badge className='mx-1 text-dark' color="light">(Purchased @ {purchasedRate} Rs)</Badge>
                  <ItemDescription onDescriptionChange={handleDescriptionChange} selectedCategory={selectedCategory} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="rate">Bag Rate</Label>
                  {loading ?
                    <Spinner color="primary" size="sm" className='mx-2' />
                    :
                    <i className="bi bi-arrow-clockwise mx-2" onClick={fetchRate} role="button"></i>
                  }
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    min="0"
                    value={bagRate}
                    onChange={handleRateChange}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="perKgRate">Kg Rate</Label>
                  <Input
                    id="perKgRate"
                    name="perKgRate"
                    type="number"
                    min="0"
                    value={perKgRate}
                    onChange={handlePerKgRateChange}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="bagQuantity">Bags</Label>
                  <Input
                    id="bagQuantity"
                    name="bagQuantity"
                    placeholder={`Stock: ${bagStock}`}
                    type="number"
                    min="0"
                    value={bagQuantity === 0 ? '' : bagQuantity}
                    onChange={handleBagQuantityChange}
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
                    step="0.001"
                    placeholder={`Stock: ${kgStock}`}
                    type="number"
                    min="0"
                    value={kgQuantity === 0 ? '' : kgQuantity}
                    onChange={handleKgQuantityChange}
                    onClick={(e) => e.target.select()}
                  />
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
                  <Label for="total">
                    <strong>Total</strong>
                  </Label>
                  <Input
                    className="bg-danger text-white"
                    id="total"
                    name="total"
                    type="number"
                    disabled
                    value={total}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="cashReceived">Cash Received</Label>
                  <Input
                    id="cashReceived"
                    name="cashReceived"
                    type="number"
                    min="0"
                    value={cashReceived}
                    onChange={handleCashReceivedChange}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Button style={{ marginTop: '32px' }}
                    color="primary"
                    type="submit"
                    disabled={submitting || selectedAccount || accountDescription || accountAmount}
                  >
                    {submitting ? <Spinner size="sm" /> : 'Submit'} {/* Show spinner when submitting */}
                  </Button>
                </FormGroup>
              </Col>
              <Col md={1}>
                <FormGroup>
                  <Label for="discount">Discount</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    value={discount === 0 ? '' : discount}
                    onChange={handleDiscountChange}
                    disabled={!cashReceived}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="received">Received</Label>
                  <Input
                    id="received"
                    name="received"
                    type="number"
                    min="0"
                    value={received === 0 ? '' : received}
                    onChange={handleReceivedChange}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="returned">Cash Returned</Label>
                  <Input
                    style={{ backgroundColor: returned < 0 ? 'rgb(246 78 96)' : '#47bc47', color: 'white' }}
                    id="returned"
                    name="returned"
                    type="number"
                    disabled
                    value={returned}
                  />
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
                  <Label for="accountDescription">Narration</Label>
                  <Input
                    id="accountDescription"
                    name="accountDescription"
                    type="textarea"
                    bsSize="sm"
                    style={{ height: "38px" }}
                    value={accountDescription}
                    onChange={(e) => setAccountDescription(e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="accountAmount">Amount Credit</Label>
                  <Input
                    id="accountAmount"
                    name="accountAmount"
                    type="number"
                    min="0"
                    value={accountAmount === 0 ? '' : accountAmount}
                    onChange={(e) => setAccountAmount(e.target.value)}
                    onClick={(e) => e.target.select()}
                  />
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

          <Modal isOpen={isModalOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>
              Do you want to print Sale Receipt?
            </ModalHeader>
            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>
                Close
              </Button>
              <Button color="primary" onClick={handleSaleReceipt}>
                Yes, Print
              </Button>
            </ModalFooter>
          </Modal>
        </CardBody>
      </Card>
    </>
  );
};

export default SaleItem;
