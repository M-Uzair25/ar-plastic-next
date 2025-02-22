'use client'
import React, { useState, useMemo } from 'react';
import { Card, CardTitle, CardBody, Form, Row, Col, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles
import Accounts from '@/components/Accounts';

const LedgerEntry = () => {
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountType, setAccountType] = useState('');
    const [description, setDescription] = useState('');
    const [previousBalance, setPreviousBalance] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('None');
    const [loading, setLoading] = useState(false);

    const handleAccountChange = async (selectedOption) => {
        setSelectedAccount(selectedOption);

        if (!selectedOption) {
            setPreviousBalance('');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/accounts?accountName=${selectedOption.value}`);
            const data = await response.json();

            if (response.ok) {
                setPreviousBalance(data.balance);
                setAccountType(data.accountType);
            } else {
                toast.error(`Error: ${data.message}`);
            }
        } catch (error) {
            toast.error('Error Fetching Balance.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatedRemainingBalance = useMemo(() => {
        let prevbalance = Number(previousBalance) || 0;
        const cAmount = Number(amount) || 0;

        if (!selectedAccount || !amount || !paymentType) return prevbalance;

        // Update the new balance based on payment type
        if (paymentType === 'Debit') {
            if (accountType === 'cash' || accountType === 'myAccount' || accountType === 'supplier') {
                prevbalance -= cAmount;  // Debit decreases balance
            } else {
                prevbalance += cAmount;  // Debit increases balance
            }
        } else if (paymentType === 'Credit') {
            if (accountType === 'cash' || accountType === 'myAccount' || accountType === 'supplier') {
                prevbalance += cAmount;  // Credit increases balance
            } else {
                prevbalance -= cAmount;  // Credit decreases balance
            }
        }
        return prevbalance;
    }, [selectedAccount, amount, paymentType, previousBalance]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedAccount || !amount || paymentType === 'None') {
            toast.error('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        const ledgerData = {
            account: selectedAccount.value,
            description,
            amount: parseInt(amount),
            paymentType,
        };

        try {
            const response = await fetch('/api/ledger/ledgerEntry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ledgerData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Ledger Entry added successfully');
                // Reset form after submission
                setSelectedAccount(null);
                setDescription('');
                setAmount('');
                setPaymentType('None');
                setPreviousBalance('');
            } else {
                toast.error(`Error: ${result.message}`);
            }
        } catch (error) {
            toast.error('Error submitting Ledger Entry.');
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
                    Create Ledger Entry
                </CardTitle>
                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="account">Account Name</Label>
                                    <Accounts onNameChange={handleAccountChange} selectedName={selectedAccount} />
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
                                        bsSize="sm"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
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

export default LedgerEntry;
