'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardTitle, CardBody, Form, Row, Col, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Accounts from '@/components/Accounts';

const CashPayment = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [description, setDescription] = useState('');
  const [previousBalance, setPreviousBalance] = useState('');
  const [cashPayment, setCashPayment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccountChange = async (selectedOption) => {
    setSelectedAccount(selectedOption);
  };

  useEffect(() => {
    fetchAccountData();
  }, [selectedAccount]);

  const fetchAccountData = async () => {
    if (!selectedAccount) {
      resetForm();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/accounts?accountName=${selectedAccount.value}`);
      const data = await response.json();

      if (response.ok) {
        setPreviousBalance(data.balance);
        setCashPayment('');
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
    const cash = Number(cashPayment) || 0;

    if (!selectedAccount || !cash) return balance;

    return balance + cash;
  }, [previousBalance, cashPayment, selectedAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAccount || !cashPayment) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (selectedAccount.value === 'Cash') {
      toast.error('Party name cannot be "Cash". Kindly select another party!');
      return;
    }

    setLoading(true);
    const paymentData = {
      account: selectedAccount.value,
      description,
      amount: parseInt(cashPayment),
    };

    try {
      const response = await fetch('/api/payments/cashPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Cash Payment successfully');
        resetForm();
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error('Error submitting Payment.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAccount(null);
    setPreviousBalance('');
    setCashPayment('');
    setDescription('');
  };

  return (
    <>
      <ToastContainer />
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
          Cash Payment
        </CardTitle>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="account">Party Name</Label>
                  <Accounts onNameChange={handleAccountChange} selectedName={selectedAccount} />
                </FormGroup>
              </Col>
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
            </Row>
            <Row>
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
                  <Label for="cashPayment">Cash Payment</Label>
                  <Input
                    id="cashPayment"
                    name="cashPayment"
                    type="number"
                    min="0"
                    value={cashPayment}
                    onChange={(e) => setCashPayment(e.target.value)}
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

export default CashPayment;
