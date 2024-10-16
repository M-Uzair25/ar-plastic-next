'use client';
import React, { useState } from 'react';
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateAccount = () => {
  const [accountData, setAccountData] = useState({
    accountName: '',
    accountNo: '',
    address: '',
    balance: 0,
    accountType: '',
  });
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccountData({ ...accountData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountData.accountName || !accountData.accountNo || !accountData.accountType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        toast.success('Account created successfully!');
        // Reset the form
        setAccountData({
          accountName: '',
          accountNo: '',
          address: '',
          balance: 0,
          accountType: '',
        });
      } else {
        const result = await response.json();
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Error submitting account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
          Create New Account
        </CardTitle>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="accountName">Name</Label>
              <Input
                id="accountName"
                name="accountName"
                type="text"
                value={accountData.accountName}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="accountNo">Number</Label>
              <Input
                id="accountNo"
                name="accountNo"
                placeholder="Enter Phone No. or Account No."
                type="text"
                value={accountData.accountNo}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="address">Address</Label>
              <Input
                id="address"
                name="address"
                type="textarea"
                bsSize="sm"
                value={accountData.address}
                onChange={handleChange}
              />
            </FormGroup>
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label for="balance">Opening Balance</Label>
                  <Input
                    id="balance"
                    name="balance"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={accountData.balance}
                    onChange={handleChange}
                    onClick={(e) => e.target.select()}
                  />
                </FormGroup>
              </Col>
              <Col>
                <Form tag="fieldset">
                  <legend>Account Type</legend>
                  {['cash', 'customer', 'supplier', 'myAccount', 'other'].map((type) => (
                    <FormGroup check inline key={type}>
                      <Label check>
                        <Input
                          name="accountType"
                          type="radio"
                          value={type}
                          checked={accountData.accountType === type}
                          onChange={handleChange}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Label>
                    </FormGroup>
                  ))}
                </Form>
              </Col>
            </Row>
            <Button className="mt-2" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Submit'}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default CreateAccount;
