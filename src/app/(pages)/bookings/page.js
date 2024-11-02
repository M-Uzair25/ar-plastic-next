'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Row, Col, Table, Card, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, Spinner,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import Accounts from '@/components/Accounts';
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Bookings = () => {
  const [bookingData, setBookingData] = useState([]);  // Store booking data
  const [selectedName, setSelectedName] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [bagQuantity, setBagQuantity] = useState('');
  const [kgQuantity, setKgQuantity] = useState('');
  const [poundRate, setPoundRate] = useState('');
  const [bagRate, setBagRate] = useState('');
  const [perKgRate, setPerKgRate] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Fetch bookings data
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookingData(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleNameChange = async (selectedOption) => {
    setSelectedName(selectedOption);
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
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

    const bookingData = {
      supplierName: selectedName.value,
      remarks,
      category: selectedCategory,
      description: selectedDescription.value,
      bagQuantity: parseInt(bagQuantity) || 0,
      kgQuantity: kgQuantity || 0,
      poundRate: parseFloat(poundRate).toFixed(2) || 0,
      bagRate: parseInt(bagRate) || 0,
      perKgRate: parseFloat(perKgRate).toFixed(2) || 0,
      total: calculateTotal
    };

    setLoading(true); // Set loading to true when submitting

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Booking created successfully');
        toggleModal();
        fetchBookings();
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
        toast.error(`Error creating booking: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Error creating booking: ${error.message}`);
    } finally {
      setLoading(false); // Set loading to false when request finishes
    }
  };
  return (
    <>
      <ToastContainer newestOnTop />
      <CardTitle tag="h6" className="border-bottom p-3 mb-2" style={{ backgroundColor: '#343a40', color: 'white' }}>
        <i className="bi bi-journal-check me-2"></i> Bookings
      </CardTitle>
      <Card>
        <CardBody>
          <Button color="dark" className="mb-4" onClick={toggleModal}>
            Create New Booking
          </Button>
          <Modal isOpen={isModalOpen} toggle={toggleModal} size='xl'>
            <ModalHeader toggle={toggleModal}>
              Create New Booking
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="Accounts">Supplier Name</Label>
                      <Accounts onNameChange={handleNameChange} selectedName={selectedName} apiEndpoint="accountType=supplier" />
                    </FormGroup>
                  </Col>
                  <Col md={5}>
                    <FormGroup>
                      <Label for="remarks">Remarks</Label>
                      <Input id="remarks" name="remarks" type='textarea' bsSize="sm" style={{ height: "38px" }} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
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
                </Row>
              </Form>
            </ModalBody>

            <ModalFooter>
              <Button type="submit" color="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Submit'}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                Close
              </Button>
            </ModalFooter>
          </Modal>

          {/* Stock Table */}
          {loading ? (
            <div className="text-center">
              <Spinner color="primary" /> {/* Loading spinner */}
            </div>
          ) : (
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Pound</th>
                  <th>Bag</th>
                  <th>Stock</th>
                  <th>Amount</th>
                  <th>Actions</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {bookingData.map((booking, index) => (
                  <tr key={booking._id}>
                    <td>{index + 1}</td>
                    <td>{format(new Date(booking.createdAt), 'dd/MM/yy')}</td>
                    <td>{booking.supplierName}</td>
                    <td>{booking.category}</td>
                    <td>{booking.description}</td>
                    <td>{booking.poundRate}</td>
                    <td>{booking.bagRate}</td>
                    <td>{formatQuantity(booking.bagQuantity, booking.kgQuantity)}</td>
                    <td>{booking.total}</td>
                    <td>
                      <Button color="success" size="sm">Received</Button>
                      <Button color="primary" className='mx-2' size="sm">Edit</Button>
                      <Button color="danger" size="sm">Delete</Button>
                    </td>
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

export default Bookings;
