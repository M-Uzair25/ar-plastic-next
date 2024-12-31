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
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Modal toggling functions
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) resetForm();  // Reset form on modal close
  };
  const toggleConfirmModal = () => setIsConfirmModalOpen(!isConfirmModalOpen);

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleNameChange = async (selectedOption) => {
    setSelectedName(selectedOption);
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
  };

  const handlePoundRateChange = (e) => calculateRates('pound', parseFloat(e.target.value));
  const handleBagRateChange = (e) => calculateRates('bag', parseFloat(e.target.value));
  const handlePerKgRateChange = (e) => calculateRates('kg', parseFloat(e.target.value));

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
  }, [poundRate, bagRate, perKgRate]);

  const calculateTotal = useMemo(() => {
    const bagTotal = bagQuantity * bagRate;
    const kgTotal = kgQuantity * perKgRate;
    return parseInt(bagTotal + kgTotal);
  }, [bagQuantity, kgQuantity, poundRate, bagRate, perKgRate]);

  const handleEditClick = (booking) => {
    setBookingToEdit(booking);
    setSelectedName({ value: booking.supplierName, label: booking.supplierName });
    setRemarks(booking.remarks);
    setSelectedCategory({ value: booking.category, label: booking.category });
    setSelectedDescription({ value: booking.description, label: booking.description });
    setBagQuantity(booking.bagQuantity);
    setKgQuantity(booking.kgQuantity);
    setPoundRate(booking.poundRate);
    setBagRate(booking.bagRate);
    setPerKgRate(booking.perKgRate);
    toggleModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedName || !selectedCategory || !selectedDescription || (!bagQuantity && !kgQuantity)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const bookingData = {
      supplierName: selectedName.value,
      remarks,
      category: selectedCategory.value,
      description: selectedDescription.value,
      bagQuantity: parseInt(bagQuantity) || 0,
      kgQuantity: kgQuantity || 0,
      poundRate: parseFloat(poundRate).toFixed(2) || 0,
      bagRate: parseInt(bagRate) || 0,
      perKgRate: parseFloat(perKgRate).toFixed(2) || 0,
      total: calculateTotal
    };

    setLoading(true);

    try {
      let response;
      if (bookingToEdit) {
        // Update booking if editing
        response = await fetch(`/api/bookings/?id=${bookingToEdit._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        });
      } else {
        // Create a new booking if not editing
        response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        });
      }

      const result = await response.json();
      if (response.ok) {
        toast.success(bookingToEdit ? 'Booking updated successfully' : 'Booking created successfully');
        toggleModal();
        fetchBookings();
        resetForm();
      } else {
        toast.error(`Error ${bookingToEdit ? 'updating' : 'creating'} booking: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Error ${bookingToEdit ? 'updating' : 'creating'} booking: ${error.message}`);
    } finally {
      setLoading(false);
      setBookingToEdit(null);
    }
  };

  // Handler to mark booking as received (creates purchase and deletes booking)
  const handleReceived = async (booking) => {
    setLoading(true);
    try {
      // Send booking data to purchase API
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName: booking.supplierName,
          remarks: booking.remarks,
          category: booking.category,
          description: booking.description,
          bagQuantity: booking.bagQuantity,
          kgQuantity: booking.kgQuantity,
          poundRate: booking.poundRate,
          bagRate: booking.bagRate,
          perKgRate: booking.perKgRate,
          total: booking.total
        }),
      });

      if (response.ok) {
        // Delete booking after purchase is created
        const deleteBooking = await fetch(`/api/bookings/?id=${booking._id}`, { method: 'DELETE' });
        if (deleteBooking.ok) {
          toast.success('Booking received successfully');
          fetchBookings();
        } else {
          const errorData = await deleteBooking.json();
          toast.error(`Error deleting booking: ${errorData.message}`);
        }
      } else {
        const errorData = await response.json();
        toast.error(`Error creating purchase: ${errorData.message}`);
      }
    } catch (error) {
      toast.error(`Error processing booking: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    toggleConfirmModal();
  };

  const handleDeleteConfirm = async (id) => {
    try {
      const response = await fetch(`/api/bookings/?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Booking deleted successfully');
        fetchBookings();
      } else {
        const errorData = await response.json();
        toast.error(`Error deleting booking: ${errorData.message}`);
      }
    } catch (error) {
      toast.error(`Error deleting booking: ${error.message}`);
    } finally {
      toggleConfirmModal();
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedName(null);
    setRemarks('');
    setSelectedCategory(null);
    setSelectedDescription(null);
    setBagQuantity('');
    setKgQuantity('');
    setPoundRate('');
    setBagRate('');
    setPerKgRate('');
    setBookingToEdit(null);
  };

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
      <ToastContainer newestOnTop />
      <CardTitle tag="h6" className="border-bottom p-3 mb-2" style={{ backgroundColor: '#343a40', color: 'white' }}>
        <i className="bi bi-journal-check me-2"></i> Bookings
      </CardTitle>
      <Card>
        <CardBody>
          <Button color="dark" className="mb-4" onClick={toggleModal}>Create New Booking</Button>
          <Modal isOpen={isModalOpen} toggle={toggleModal} size='xl'>
            <ModalHeader toggle={toggleModal}>
              {bookingToEdit ? 'Edit Booking' : 'Create New Booking'}
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

                      {bookingToEdit ? (
                        <div className='mt-2'>
                          {selectedDescription.value}
                        </div>
                      ) : (
                        <ItemDescription onDescriptionChange={handleDescriptionChange} selectedCategory={selectedCategory} />
                      )}
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
                {loading ? <Spinner size="sm" /> : (bookingToEdit ? 'Update' : 'Submit')}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                Close
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={isConfirmModalOpen} toggle={toggleConfirmModal}>
            <ModalHeader toggle={toggleConfirmModal}>
              Confirm Deletion
            </ModalHeader>
            <ModalBody>
              {bookingToDelete && (
                <>
                  <p><strong>Supplier:</strong> {bookingToDelete.supplierName}</p>
                  <p>
                    <strong>Items:</strong> {formatQuantity(bookingToDelete.bagQuantity, bookingToDelete.kgQuantity)} {bookingToDelete.description}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> {bookingToDelete.total}
                  </p>
                  <p>Are you sure you want to delete this booking?</p>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={() => handleDeleteConfirm(bookingToDelete._id)}>
                Delete
              </Button>
              <Button color="secondary" onClick={toggleConfirmModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* Booking Data Table */}
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
                  <th>Quantity</th>
                  <th>Total</th>
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
                      <Button color="success" size="sm" onClick={() => handleReceived(booking)}>Received</Button>
                      <Button color="primary" className='mx-2' size="sm" onClick={() => handleEditClick(booking)}>Edit</Button>
                      <Button color="danger" size="sm" onClick={() => handleDeleteClick(booking)}>Delete</Button>
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
