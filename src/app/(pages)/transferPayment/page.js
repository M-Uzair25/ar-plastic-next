'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardTitle, CardBody, Form, Row, Col, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Accounts from '@/components/Accounts';

const TransferPayment = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [description, setDescription] = useState('');
  const [previousBalance, setPreviousBalance] = useState('');
  const [cashPaid, setCashPaid] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccountChange = async (selectedOption) => {
    setSelectedAccount(selectedOption);
  };

  const handleSupplierChange = async (selectedOption) => {
    setSelectedSupplier(selectedOption);
  };

  useEffect(() => {
    fetchSupplierData();
  }, [selectedSupplier]);

  const fetchSupplierData = async () => {
    if (!selectedSupplier) {
      setPreviousBalance('');
      setCashPaid('');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/accounts?accountName=${selectedSupplier.value}`);
      const data = await response.json();

      if (response.ok) {
        setPreviousBalance(data.balance);
        setCashPaid('');
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
    const cash = Number(cashPaid) || 0;

    if (!selectedSupplier || !cash) return balance;

    return balance + cash;
  }, [previousBalance, cashPaid, selectedSupplier]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAccount || !selectedSupplier || !cashPaid) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (selectedAccount.value === selectedSupplier.value) {
      toast.error('Supplier and Account name cannot be same.');
      return;
    }

    setLoading(true);
    const paymentData = {
      account: selectedAccount.value,
      supplierName: selectedSupplier.value,
      description,
      amount: parseInt(cashPaid),
    };

    try {
      const response = await fetch('/api/payments/transferPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Payment added successfully');
        resetForm();
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error('Error submitting payment.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSupplier(null);
    setSelectedAccount(null);
    setPreviousBalance('');
    setCashPaid('');
    setDescription('');
  };

  return (
    <>
      <ToastContainer />
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
          Account Transfer Payment
        </CardTitle>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="account">Account Name: (Transfered from)</Label>
                  <Accounts onNameChange={handleAccountChange} selectedName={selectedAccount} apiEndpoint="accountType=customer,myAccount" />
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
                  <Label for="cashPaid">Cash Paid</Label>
                  <Input
                    id="cashPaid"
                    name="cashPaid"
                    type="number"
                    min="0"
                    value={cashPaid}
                    onChange={(e) => setCashPaid(e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="Supplier">Supplier/Customer Name: (Deposited in)</Label>
                  <Accounts onNameChange={handleSupplierChange} selectedName={selectedSupplier} apiEndpoint="accountType=customer,supplier" />
                </FormGroup>
              </Col>
              <Col>
                <Button style={{ marginTop: '32px' }} color="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Submit'}
                </Button>
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
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default TransferPayment;
