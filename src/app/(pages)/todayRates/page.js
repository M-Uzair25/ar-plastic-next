'use client'
import React, { useState, useEffect } from 'react';
import {
  Row, Col, Table, Card, CardTitle, CardBody, Button, FormGroup, Label, Input, Spinner, Progress,
  Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import ItemCategory from '@/components/ItemCategory';
import ItemDescription from '@/components/ItemDescription';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TodayRates() {
  const [items, setItems] = useState([]);  // Store items data
  const [isLoading, setIsLoading] = useState(true);  // Loading state
  const [isUpdating, setIsUpdating] = useState(false);  // Updating state for progress bar

  const [selectedCategory, setSelectedCategory] = useState(null); // Selected category
  const [selectedDescription, setSelectedDescription] = useState(null); // Selected description
  const [searchRate, setSearchRate] = useState(''); // Search query for the bag rate and kg rate

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRate, setNewRate] = useState(0); // State to store the new rate
  const [currentItemId, setCurrentItemId] = useState(null); // State to store the ID of the item being edited

  // Handle category change
  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  };

  // Handle description change
  const handleDescriptionChange = (selectedOption) => {
    setSelectedDescription(selectedOption);
  };

  // Handle bag and kg rate search change
  const handleSearchRateChange = (event) => {
    setSearchRate(event.target.value);  // Update searchRate state with input value
  };

  // Fetch items data based on selected category and description
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (selectedDescription) queryParams.append('description', selectedDescription.value);

      const response = await fetch(`/api/stock?${queryParams.toString()}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast.error('Error fetching items');
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedDescription]);

  // Filter items based on the search rate for Bag or Kg
  const filteredItems = items.filter((item) => {
    const kgRate = item.sellRate / 25;  // Calculate the Kg rate
    // Check if search rate is empty or if the item's sellRate or kgRate matches the search query
    return searchRate === '' || item.sellRate.toString().includes(searchRate) || kgRate.toString().includes(searchRate);
  });

  const handleEdit = (itemId, currentSellRate) => {
    setIsEditModalOpen(true);
    setNewRate(currentSellRate); // Set the initial value to the current sell rate
    setCurrentItemId(itemId);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
  };

  const handleUpdateRate = async () => {
    setIsUpdating(true); // Start updating
    try {
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: currentItemId, sellRate: newRate }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Rate updated successfully');
        setIsEditModalOpen(false);
        fetchItems(); // Refetch the updated items after editing
      } else {
        toast.error(result.message || 'Error updating item');
      }
    } catch (error) {
      toast.error('Error updating rate');
      console.error('Error updating rate:', error);
    } finally {
      setIsUpdating(false); // End updating
    }
  };

  return (
    <Row>
      <Col lg="12">
        <ToastContainer />
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
            <i className="bi bi-card-text me-2"> </i>
            Today Rates: {format(new Date(), 'dd MMM yyyy hh:mm a')}
          </CardTitle>
          <CardBody>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="category">Category</Label>
                  <ItemCategory onCategoryChange={handleCategoryChange} selectedDescription={selectedDescription} />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <ItemDescription onDescriptionChange={handleDescriptionChange} selectedCategory={selectedCategory} />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="searchRate">Search Bag or Kg Rate</Label>
                  <Input
                    id="searchRate"
                    name="searchRate"
                    placeholder="Enter Bag or Kg Rate"
                    type="search"
                    value={searchRate}
                    onChange={handleSearchRateChange}
                  />
                </FormGroup>
              </Col>
            </Row>
            {isLoading ? (
              <div className="text-center">
                <Spinner color="primary" /> {/* Loading spinner */}
              </div>
            ) : filteredItems.length > 0 ? (
              <>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Bag Rate (25Kg)</th>
                      <th>Kg Rate</th>
                      <th>Stock</th>
                      <th>Edit Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.category}</td>
                        <td>{item.description}</td>
                        <td>{item.sellRate}</td>
                        <td>{item.sellRate / 25}</td>
                        <td>
                          <span style={{ color: item.bagQuantity > 0 ? 'blue' : 'red', fontWeight: 'bold' }}>
                            {item.bagQuantity} </span>
                          Bags,
                          <span style={{ color: item.kgQuantity > 0 ? 'darkgreen' : 'red', fontWeight: 'bold' }}> {item.kgQuantity} </span>
                          Kg
                        </td>
                        <td>
                          <Button color="primary" size="sm" onClick={() => handleEdit(item._id, item.sellRate)}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

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
                    {isUpdating && <Progress animated value="100" />} {/* Progress bar during update */}
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" onClick={handleCancelEdit}>Cancel</Button>
                    <Button color="primary" onClick={handleUpdateRate} disabled={isUpdating}>
                      {isUpdating ? 'Updating...' : 'Update Rate'}
                    </Button>
                  </ModalFooter>
                </Modal>
              </>
            ) : (
              <strong>No items found</strong>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}

export default TodayRates;
