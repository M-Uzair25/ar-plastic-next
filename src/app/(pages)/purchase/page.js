'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import Accounts from '@/components/Accounts';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { generatePurchasePDF } from '@/components/pdfReports/generatePurchasePDF';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Purchase = () => {
  const [selectedName, setSelectedName] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [bagQuantity, setBagQuantity] = useState('');
  const [kgQuantity, setKgQuantity] = useState('');
  const [poundRate, setPoundRate] = useState('');
  const [bagRate, setBagRate] = useState('');
  const [perKgRate, setPerKgRate] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [selectedDate, setSelectedDate] = useState(null);
  const [modal, setModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [supplierName, setSupplierName] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const toggleModal = () => setModal(!modal);

  const handleNameChange = async (selectedOption) => {
    setSelectedName(selectedOption);
  };

  const handleSupplierNameChange = async (selectedOption) => {
    setSupplierName(selectedOption);
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
  };

  const calculateRates = useCallback((rateType, value) => {
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
  }, []);

  const handlePoundRateChange = (e) => calculateRates('pound', parseFloat(e.target.value));
  const handleBagRateChange = (e) => calculateRates('bag', parseFloat(e.target.value));
  const handlePerKgRateChange = (e) => calculateRates('kg', parseFloat(e.target.value));

  const calculateTotal = useMemo(() => {
    const bagTotal = bagQuantity * bagRate;
    const kgTotal = kgQuantity * perKgRate;
    return parseInt(bagTotal + kgTotal);
  }, [bagQuantity, kgQuantity, poundRate, bagRate, perKgRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedName || !selectedCategory || !selectedDescription || (!bagQuantity && !kgQuantity)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const purchaseData = {
      supplierName: selectedName.value,
      remarks,
      category: selectedCategory.value,
      description: selectedDescription.value,
      bagQuantity: parseInt(bagQuantity) || 0,
      kgQuantity: kgQuantity || 0,
      poundRate: parseFloat(poundRate).toFixed(2) || 0,
      bagRate: parseInt(bagRate) || 0,
      perKgRate: parseFloat(perKgRate).toFixed(2) || 0,
      total: calculateTotal,
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
        fetchPurchases(new Date());
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

  const fetchPurchases = async (selectedDate = '', startDate = '', endDate = '', supplierName = '') => {
    setIsLoading(true); // Show the loading spinner
    try {
      const queryParams = new URLSearchParams();

      if (selectedDate) queryParams.append('selectedDate', format(selectedDate, 'yyyy-MM-dd'));
      if (startDate) queryParams.append('startDate', format(startDate, 'yyyy-MM-dd'));
      if (endDate) queryParams.append('endDate', format(endDate, 'yyyy-MM-dd'));
      if (supplierName) queryParams.append('supplierName', supplierName);

      const response = await fetch(`/api/purchase?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      } else {
        toast.error('Failed to fetch purchases');
      }
    } catch (error) {
      toast.error(`Error fetching purchases: ${error.message}`);
    } finally {
      setModal(false);
      setIsLoading(false); // Hide the loading spinner
    }
  };

  const handleGenerateReport = () => {
    setSelectedDate(null);
    fetchPurchases(null, startDate, endDate, supplierName?.value || '');
  };

  // Handle print sales
  const handleDownloadPDF = () => {
    generatePurchasePDF(purchases);
  };

  useEffect(() => {
    fetchPurchases(new Date());
  }, []);

  // Display Formatted Quantities
  const formatQuantity = (bagQuantity, kgQuantity) => {
    if (bagQuantity > 0 && kgQuantity > 0) {
      return `${bagQuantity} Bag, ${kgQuantity} Kg`;
    } else if (bagQuantity > 0) {
      return `${bagQuantity} Bag`;
    } else if (kgQuantity > 0) {
      return `${kgQuantity} Kg`;
    } else {
      return '';
    }
  };

  return (
    <>
      <ToastContainer />
      <CardTitle tag="h6" className="border-bottom p-3 mb-2" style={{ backgroundColor: '#343a40', color: 'white' }}>
        Purchase Item
      </CardTitle>
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="Accounts">Supplier Name</Label>
                  <Accounts onNameChange={handleNameChange} selectedName={selectedName} />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup>
                  <Label for="remarks">Remarks</Label>
                  <Input id="remarks" name="remarks" type='textarea' bsSize="sm" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="bagQuantity">Bags</Label>
                  <Input id="bagQuantity" name="bagQuantity" type="number" min="0" value={bagQuantity} onChange={(e) => setBagQuantity(e.target.value)} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="kgQuantity">Kg</Label>
                  <Input id="kgQuantity" name="kgQuantity" type="number" step="0.001" min="0" value={kgQuantity} onChange={(e) => setKgQuantity(e.target.value)} />
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
                  <Label for="description">Item Description</Label>
                  <ItemDescription onDescriptionChange={handleDescriptionChange} selectedCategory={selectedCategory} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="poundRate">Pound Rate</Label>
                  <Input id="poundRate" name="poundRate" type="number" step="any" min="0" value={poundRate} onChange={handlePoundRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="bagRate">Bag Rate</Label>
                  <Input id="bagRate" name="bagRate" type="number" step="any" min="0" value={bagRate} onChange={handleBagRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="perKgRate">Kg Rate</Label>
                  <Input id="perKgRate" name="perKgRate" type="number" step="any" min="0" value={perKgRate} onChange={handlePerKgRateChange} />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="total"><strong>Total Amount</strong></Label>
                  <Input className="bg-success text-white" id="total" name="total" type="text" value={calculateTotal} readOnly />
                </FormGroup>
              </Col>
              <Col>
                <Button type="submit" color="primary" disabled={isLoading} style={{ marginTop: '32px' }}>
                  {isLoading ? <Spinner size="sm" /> : 'Submit'}
                </Button>
              </Col>
            </Row>
          </Form>

          {/*Purchases */}
          <Row>
            <Col md={2}>
              <h5 className="mt-4">Purchase History</h5>
            </Col>
            <Col className="mt-3" md={2}>
              <DatePicker
                selected={selectedDate}
                placeholderText='dd/mm/yyyy'
                onChange={(date) => {
                  setSelectedDate(date);
                  fetchPurchases(date); // Fetch data for the newly selected date
                }}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </Col>
            <Col className='mt-3' md={2}>
              <Button color="info" onClick={toggleModal} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Generate Report'}
              </Button>
            </Col>
            <Col className='mt-3'>
              <Button color="info" onClick={handleDownloadPDF}>
                Download PDF
              </Button>
            </Col>
          </Row>

          <Modal isOpen={modal} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>Generate Purchase Report</ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label for="startDate">Start Date</Label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)} // Set selected date
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/MM/yyyy"
                  className="form-control mx-2"
                />
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => setStartDate(null)} // Clear the date
                  className="mx-4"
                >
                  Clear
                </Button>
              </FormGroup>
              <FormGroup>
                <Label for="endDate">End Date</Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)} // Set selected date
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/MM/yyyy"
                  className="form-control mx-2"
                />
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => setEndDate(null)} // Clear the date
                  className="mx-4"
                >
                  Clear
                </Button>
              </FormGroup>
              <FormGroup>
                <Label for="supplierName">Supplier Name</Label>
                <Accounts onNameChange={handleSupplierNameChange} selectedName={supplierName} />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={handleGenerateReport} disabled={isLoading}>
                Generate
              </Button>{' '}
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {isLoading && (
            <div className="text-center my-3">
              <Spinner color="primary" />
            </div>
          )}

          {purchases.length === 0 ? (
            <p>No purchases found.</p>
          ) : (
            <Table bordered hover responsive className='mt-3'>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Pound</th>
                  <th>Bag</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase, index) => (
                  <tr key={purchase._id}>
                    <td>{index + 1}</td>
                    <td>{format(new Date(purchase.createdAt), 'dd/MM/yy')}</td>
                    <td>{purchase.supplierName}</td>
                    <td>{purchase.category}</td>
                    <td>{purchase.description}</td>
                    <td>{purchase.poundRate}</td>
                    <td>{purchase.bagRate}</td>
                    <td>{formatQuantity(purchase.bagQuantity, purchase.kgQuantity)}</td>
                    <td>{purchase.total}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default Purchase;
