'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Row, Col, Table, Card, CardTitle, CardBody, Button, FormGroup, Input, Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

function TodayRates() {
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentDate = new Date();

  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };
  const filteredRates = rates.filter((rate) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      rate.category.toLowerCase().includes(searchTerm) ||
      rate.description.toLowerCase().includes(searchTerm)
    );
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRate, setNewRate] = useState(0); // State to store the new rate
  const [currentItemId, setCurrentItemId] = useState(null); // State to store the ID of the item being edited
  const handleEdit = (itemId, currentSellRate) => {
    // Open the edit modal
    setIsEditModalOpen(true);
    setNewRate(currentSellRate); // Set the initial value to the current sell rate
    setCurrentItemId(itemId);
  };

  const handleCancelEdit = () => {
    // Close the edit modal
    setIsEditModalOpen(false);
  };
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const handleUpdateRate = async () => {
    try {
      // Make a PUT request to update the sellRate
      const response = await axios.put('/api/items', { itemId: currentItemId, sellRate: newRate });
      console.log('Item updated successfully:', response.data);
      // Close the edit modal
      setIsEditModalOpen(false);

      // Refetch the updated rates after editing
      setIsLoading(true);
      setError(null);
      await delay(1000); // Delay 1 second to show data after update
      try {
        const response = await axios.get('/api/items');
        setRates(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      // Handle error, e.g., show a notification to the user
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/items');
        setRates(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Row>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0"
            style={{ backgroundColor: '#343a40', color: 'white' }}>
            <i className="bi bi-card-text me-2"> </i>
            Today Rates {currentDate.getDate()} {currentDate.toLocaleDateString('en-US', { month: 'long' })}, {currentDate.getFullYear()}
          </CardTitle>
          <CardBody>
            {isLoading && <p className="text-center">Loading rates...</p>}
            {error && <p className="text-center text-danger">Error fetching rates: {error.message}</p>}
            <Col md={3}>
              <FormGroup>
                <Input
                  id="search"
                  name="search"
                  value={searchQuery}
                  placeholder="Search"
                  type="search"
                  onChange={handleSearch}
                />
              </FormGroup>
            </Col>
            {filteredRates.length > 0 && (
              <Table bordered>
                <thead>
                  <tr>
                    <th>Item Category</th>
                    <th>Description</th>
                    <th>Bag Rate</th>
                    <th>Kg Rate</th>
                    <th>Stock</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map((rate) => (
                    <tr key={rate._id}>
                      <td scope="row">{rate.category}</td>
                      <td>{rate.description}</td>
                      <td>{rate.sellRate}</td>
                      <td>{rate.sellRate / 25}</td>
                      <td className="text-end">
                        {rate.bagQuantity ? (
                          <span style={{ color: 'blue', fontWeight: 'bold' }}>{rate.bagQuantity} </span>
                        ) : (
                          <span style={{ color: 'red' }}>{rate.bagQuantity} </span>
                        )}
                        Bags,
                        {rate.kgQuantity ? (
                          <span style={{ color: 'darkgreen', fontWeight: 'bold' }}> {rate.kgQuantity} </span>
                        ) : (
                          <span style={{ color: 'red' }}> {rate.kgQuantity} </span>
                        )}
                        Kg
                      </td>
                      <td>
                        <Button color="primary" size="sm" onClick={() => handleEdit(rate._id, rate.sellRate)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <Modal isOpen={isEditModalOpen} toggle={handleCancelEdit}>
              <ModalHeader>Edit Rate</ModalHeader>
              <ModalBody>
                <FormGroup>
                  <Input
                    type="number"
                    placeholder="New Rate"
                    min="0"
                    value={newRate}
                    onChange={(e) => setNewRate(parseFloat(e.target.value))}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button color="primary" onClick={handleUpdateRate}>
                  Update Rate
                </Button>
              </ModalFooter>
            </Modal>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}

export default TodayRates;
