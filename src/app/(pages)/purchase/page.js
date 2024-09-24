'use client'
import React, { useState, useCallback } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import CustomerName from '@/components/Accounts';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Purchase = () => {
  const [date, setDate] = useState(new Date());
  const [selectedName, setSelectedName] = useState(null);
  const [accountType, setAccountType] = useState('cash');
  const [remarks, setRemarks] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [bagQuantity, setBagQuantity] = useState('');
  const [kgQuantity, setKgQuantity] = useState('');
  const [poundRate, setPoundRate] = useState('');
  const [bagRate, setBagRate] = useState('');
  const [perKgRate, setPerKgRate] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleNameChange = async (selectedOption) => {
    setSelectedName(selectedOption);
    const accountType = await fetchAccountType(selectedOption.value);
    setAccountType(accountType);
  };

  const handleBagQuantityChange = (e) => {
    setBagQuantity(e.target.value);
  };

  const handleKgQuantityChange = (e) => {
    setKgQuantity(e.target.value);
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  };

  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
  };

  const calculateRates = (rateType, value) => {
    let newPoundRate = poundRate;
    let newBagRate = bagRate;
    let newPerKgRate = perKgRate;

    if (rateType === 'pound') {
      newPoundRate = value;
      newBagRate = value * 55;
      newPerKgRate = newBagRate / 25;
    } else if (rateType === 'bag') {
      newBagRate = value;
      newPoundRate = value / 55;
      newPerKgRate = value / 25;
    } else if (rateType === 'kg') {
      newPerKgRate = value;
      newBagRate = value * 25;
      newPoundRate = newBagRate / 55;
    }

    setPoundRate(newPoundRate);
    setBagRate(newBagRate);
    setPerKgRate(newPerKgRate);
  };

  const handlePoundRateChange = (e) => calculateRates('pound', parseFloat(e.target.value));
  const handleBagRateChange = (e) => calculateRates('bag', parseFloat(e.target.value));
  const handlePerKgRateChange = (e) => calculateRates('kg', parseFloat(e.target.value));


  const fetchAccountType = useCallback(async (accountName) => {
    try {
      const response = await fetch(`/api/accounts?accountName=${accountName}`);
      if (!response.ok) throw new Error('Failed to fetch account type');
      const data = await response.json();
      return data.length > 0 ? data[0].accountType : '';
    } catch (error) {
      console.error('Error fetching account type:', error);
      alert('Error fetching account type');
      return '';
    }
  }, []);

  const calculateTotal = () => {
    const bagTotal = bagQuantity * bagRate;
    const kgTotal = kgQuantity * perKgRate;
    return bagTotal + kgTotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedName || !selectedCategory || !selectedDescription || (!bagQuantity && !kgQuantity)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const purchaseData = {
      supplierName: selectedName.value,
      remarks,
      dateOfPurchase: date,
      category: selectedCategory,
      description: selectedDescription.value,
      bagQuantity: parseInt(bagQuantity) || 0,
      kgQuantity: kgQuantity || 0,
      poundRate: parseFloat(poundRate) || 0,
      bagRate: parseFloat(bagRate) || 0,
      perKgRate: parseFloat(perKgRate) || 0,
      total: calculateTotal(),
    };

    setIsLoading(true); // Set loading to true when submitting

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Purchase submitted successfully');
        // Reset the form
        setSelectedName(null);
        setRemarks('');
        setSelectedCategory(null);
        setSelectedDescription(null);
        setBagQuantity('');
        setKgQuantity('');
        setPoundRate('');
        setBagRate('');
        setPerKgRate('');
      } else {
        toast.error(`Error submitting purchase: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Error submitting purchase: ${error.message}`);
    } finally {
      setIsLoading(false); // Set loading to false when request finishes
    }
  };

  return (
    <>
      <ToastContainer /> {/* Toast notifications container */}
      <CardTitle tag="h6" className="border-bottom p-3 mb-2" style={{ backgroundColor: '#343a40', color: 'white' }}>
        Purchase Item
      </CardTitle>
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="customerName">Supplier Name</Label>
                  <CustomerName onNameChange={handleNameChange} selectedName={selectedName} />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup>
                  <Label for="remarks">Remarks</Label>
                  <Input id="remarks" name="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label for="date">Date of Purchase</Label>
                  <DatePicker
                    selected={date}
                    onChange={(date) => setDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="bagQuantity">Bags</Label>
                  <Input id="bagQuantity" name="bagQuantity" type="number" min="0" value={bagQuantity} onChange={handleBagQuantityChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="kgQuantity">Kg</Label>
                  <Input id="kgQuantity" name="kgQuantity" type="number" min="0" value={kgQuantity} onChange={handleKgQuantityChange} />
                </FormGroup>
              </Col>
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
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="poundRate">Pound Rate</Label>
                  <Input id="poundRate" name="poundRate" type="number" step="0.01" min="0" value={poundRate} onChange={handlePoundRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="bagRate">Bag Rate</Label>
                  <Input id="bagRate" name="bagRate" type="number" step="0.01" min="0" value={bagRate} onChange={handleBagRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="perKgRate">Kg Rate</Label>
                  <Input id="perKgRate" name="perKgRate" type="number" step="0.01" min="0" value={perKgRate} onChange={handlePerKgRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="total"><strong>Total Amount</strong></Label>
                  <Input className="bg-success text-white" id="total" name="total" type="text" value={calculateTotal()} readOnly />
                </FormGroup>
              </Col>
            </Row>
            <Button type="submit" color="primary" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Submit'}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default Purchase;
