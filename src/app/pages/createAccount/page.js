'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, CardTitle, CardBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useRouter } from 'next/navigation'

const CreateAccount = () => {
  const router = useRouter()
  const [accountData, setAccountData] = useState({
    accountName: '',
    accountNo: '',
    address: '',
    openingBalance: 0,
    acctype: 'customer',
  });

  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    setButtonDisabled(
      !accountData.accountName || !accountData.accountNo || !accountData.address
    );
  }, [accountData]);

  const handleChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/accounts', accountData);
      console.log(response.data); // Handle successful creation

      // Example: Redirect to a success page or display a success message
      router.push('/pages/saleItem');
    } catch (error) {
      if (error.response.status === 400) {
        // Account already exists
        alert('Sorry: An Account with this name already exists');
      } else {
        // Other errors
        alert('Error creating account: ' + error.message);
      }
    }
  };

  return (
    <Card>
      <CardTitle tag="h5" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
        <i className="me-2"> </i>
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
            />
          </FormGroup>
          <FormGroup>
            <Label for="accountNo">Number</Label>
            <Input
              id="accountNo"
              name="accountNo"
              placeholder="Enter Phone No. or Account No."
              type="number"
              min="0"
              value={accountData.accountNo}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={accountData.address}
              onChange={handleChange}
            />
          </FormGroup>
          <Row>
            <Col md={2}>
              <FormGroup>
                <Label for="openingBalance">Opening Balance</Label>
                <Input
                  id="openingBalance"
                  name="openingBalance"
                  type="number"
                  min="0"
                  value={accountData.openingBalance}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup tag="fieldset">
                <legend>Account Type</legend>
                <FormGroup check>
                  <Label check>
                    <Input
                      name="acctype"
                      id="customer"
                      type="radio"
                      value="customer"
                      checked={accountData.acctype === 'customer'}
                      onChange={handleChange}
                    />
                    Customer
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      name="acctype"
                      id="supplier"
                      type="radio"
                      value="supplier"
                      checked={accountData.acctype === 'supplier'}
                      onChange={handleChange}
                    />
                    Supplier
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      name="acctype"
                      id="myAccount"
                      type="radio"
                      value="myAccount"
                      checked={accountData.acctype === 'myAccount'}
                      onChange={handleChange}
                    />
                    My Account
                  </Label>
                </FormGroup>
              </FormGroup>
            </Col>
          </Row>
          <Button className="mt-2" disabled={buttonDisabled}>Submit</Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default CreateAccount;
