'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardTitle, CardBody, Form, Row, Col, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Accounts from '@/components/Accounts';

const TransferReceiving = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [description, setDescription] = useState('');
  const [previousBalance, setPreviousBalance] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomerChange = async (selectedOption) => {
    setSelectedCustomer(selectedOption);
  };

  const handleAccountChange = async (selectedOption) => {
    setSelectedAccount(selectedOption);
  };

  useEffect(() => {
    fetchCustomerData();
  }, [selectedCustomer]);

  const fetchCustomerData = async () => {
    if (!selectedCustomer) {
      setPreviousBalance('');
      setCashReceived('');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/accounts?accountName=${selectedCustomer.value}`);
      const data = await response.json();

      if (response.ok) {
        setPreviousBalance(data.balance);
        setCashReceived('');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error('Error Fetching Account.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatedRemainingBalance = useMemo(() => {
    const balance = Number(previousBalance) || 0;
    const cash = Number(cashReceived) || 0;

    if (!selectedCustomer || !cash) return balance;

    return balance - cash;
  }, [previousBalance, cashReceived, selectedCustomer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer || !selectedAccount || !cashReceived) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (selectedCustomer.value === selectedAccount.value) {
      toast.error('Customer and Account name cannot be same.');
      return;
    }

    setLoading(true);
    const receivingData = {
      customerName: selectedCustomer.value,
      account: selectedAccount.value,
      description,
      amount: parseInt(cashReceived),
    };

    try {
      const response = await fetch('/api/receivings/transferReceiving', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receivingData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Receiving added successfully');
        resetForm();
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error('Error submitting receiving.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedAccount(null);
    setPreviousBalance('');
    setCashReceived('');
    setDescription('');
  };

  return (
    <>
      <ToastContainer />
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
          Account Transfer Receiving
        </CardTitle>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="customer">Customer Name: (Transfered From)</Label>
                  <Accounts onNameChange={handleCustomerChange} selectedName={selectedCustomer} apiEndpoint="accountType=customer" />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="previousBalance">Previous Balance</Label>
                  <Input
                    style={{ backgroundColor: '#343a40', color: 'white' }}
                    id="previousBalance"
                    name="previousBalance"
                    type="number"
                    value={previousBalance}
                    disabled
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label for="remainingBalance">New Remaining Balance</Label>
                  <Input
                    style={{ backgroundColor: 'rgb(246, 78, 96)', color: 'white' }}
                    id="remainingBalance"
                    type="number"
                    value={calculatedRemainingBalance}
                    disabled
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="description">Narration</Label>
                  <Input
                    id="description"
                    name="description"
                    type="textarea"
                    bsSize="sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    onChange={(e) => setCashReceived(e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="account">Account Name: (Transfered To)</Label>
                  <Accounts onNameChange={handleAccountChange} selectedName={selectedAccount} apiEndpoint="accountType=supplier,myAccount" />
                </FormGroup>
              </Col>
              <Col>
                <Button style={{ marginTop: '32px' }} color="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Submit'}
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default TransferReceiving;
