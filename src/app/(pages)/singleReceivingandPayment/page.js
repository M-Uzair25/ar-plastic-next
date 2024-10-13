'use client'
import React, { useState } from 'react';
import { Card, CardTitle, CardBody, Form, Row, Col, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles
import Accounts from '@/components/Accounts';

const singleReceivingandPayment = () => {
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('None');
    const [loading, setLoading] = useState(false);

    const handleAccountChange = async (selectedOption) => {
        setSelectedAccount(selectedOption);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedAccount || !amount || paymentType === 'None') {
            toast.error('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        const paymentData = {
            account: selectedAccount.value,
            description,
            amount: parseInt(amount),
            paymentType,
        };

        try {
            const response = await fetch('/api/receivingandpayment/singleLedger', {
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
                setSelectedAccount(null);
                setDescription('');
                setAmount('');
                setPaymentType('None');
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
                    Maintain One Ledgers (For Cheques)
                </CardTitle>
                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="account">Account</Label>
                                    <Accounts onNameChange={handleAccountChange} selectedName={selectedAccount} />
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
                        </Row>
                        <Row>
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
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="payment">Debit / Credit</Label>
                                    <Input
                                        id="payment"
                                        name="payment"
                                        type="select"
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value)}
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

export default singleReceivingandPayment;
