'use client'
import React, { useState } from 'react';
import { Card, CardTitle, CardBody, Form, Row, Col, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles
import Accounts from '@/components/Accounts';

const doubleReceivingandPayment = () => {
    const [selectedCustomerName, setSelectedCustomerName] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentType1, setPaymentType1] = useState('None');
    const [paymentType2, setPaymentType2] = useState('None');
    const [loading, setLoading] = useState(false);

    const handleCustomerNameChange = async (selectedOption) => {
        setSelectedCustomerName(selectedOption);
    };
    const handleAccountChange = async (selectedOption) => {
        setSelectedAccount(selectedOption);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCustomerName || !selectedAccount || !amount || paymentType1 === 'None' || paymentType2 === 'None') {
            toast.error('Please fill in all required fields.');
            return;
        }
        if (!selectedCustomerName.value === !selectedAccount.value) {
            toast.error('Customer and Account name cannot be same.');
            return;
        }

        setLoading(true);
        const paymentData = {
            customerName: selectedCustomerName.value,
            account: selectedAccount.value,
            description,
            amount: parseInt(amount),
            paymentType1,
            paymentType2,
        };

        try {
            const response = await fetch('/api/receivingandpayment/doubleLedger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Payment added successfully');
                // Reset form after submission
                setSelectedCustomerName(null);
                setSelectedAccount(null);
                setDescription('');
                setAmount('');
                setPaymentType1('None');
                setPaymentType2('None');
            } else {
                toast.error(`Error: ${result.message}`);
            }
        } catch (error) {
            toast.error('Error submitting payment.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <Card>
                <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
                    <i className="me-2"> </i>
                    Maintain Two Ledgers (For Cash and Customer)
                </CardTitle>
                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="customerName">Customer Name</Label>
                                    <Accounts onNameChange={handleCustomerNameChange} selectedName={selectedCustomerName} />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="payment">Debit / Credit</Label>
                                    <Input
                                        id="payment"
                                        name="payment"
                                        type="select"
                                        value={paymentType1}
                                        onChange={(e) => setPaymentType1(e.target.value)}
                                    >
                                        <option value="None">None</option>
                                        <option value="Debit">Debit - Banam</option>
                                        <option value="Credit">Credit - Jamma</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="description">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        placeholder="Description"
                                        type="textarea"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="0"
                                        onClick={(e) => e.target.select()}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="account">Account Name</Label>
                                    <Accounts onNameChange={handleAccountChange} selectedName={selectedAccount} />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="payment">Debit / Credit</Label>
                                    <Input
                                        id="payment"
                                        name="payment"
                                        type="select"
                                        value={paymentType2}
                                        onChange={(e) => setPaymentType2(e.target.value)}
                                    >
                                        <option value="None">None</option>
                                        <option value="Debit">Debit - Banam</option>
                                        <option value="Credit">Credit - Jamma</option>
                                    </Input>
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

export default doubleReceivingandPayment;
