'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, Card, CardTitle, CardBody, Button, FormGroup, Input } from "reactstrap";

function TodayRates() {
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentDate = new Date();

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
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
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
                  placeholder="Search"
                  type="search"
                />
              </FormGroup>
            </Col>
            {rates.length > 0 && (
              <Table bordered>
                <thead>
                  <tr>
                    <th>Item Category</th>
                    <th>Item Sub-Category</th>
                    <th>Color</th>
                    <th>Number</th>
                    <th>Rate</th>
                    <th>Stock</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate._id}>
                      <td scope="row">{rate.itemCategory}</td>
                      <td>{rate.itemSubcategory}</td>
                      <td>{rate.color}</td>
                      <td>{rate.number}</td>
                      <td>{rate.sellRate}</td>
                      <td>{rate.bagQuantity}Bags {rate.kgQuantity}Kg</td>
                      <td>
                        <Button color="primary" size="sm">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}

export default TodayRates;
