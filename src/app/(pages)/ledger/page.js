// Ledger.js (Frontend)
'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardTitle, CardBody, Table, FormGroup, Label, Input, Button } from 'reactstrap';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Accounts from '@/components/Accounts';

const Ledger = () => {
    const [selectedName, setSelectedName] = useState({ value: '', label: '' });
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [ledgerData, setLedgerData] = useState([]); // Store fetched ledger entries
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [closingBalance, setClosingBalance] = useState(0);

    // Handle name change for party
    const handleNameChange = async (selectedOption) => {
        setSelectedName(selectedOption);
    };

    // Fetch ledger data from backend
    const fetchLedger = async () => {
        if (!selectedName.value) {
            alert('Please select a party name.');
            return;
        }

        try {
            const queryParams = new URLSearchParams({
                party: selectedName.value,
                startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
                endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
            });

            const response = await fetch(`/api/ledger?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setLedgerData(data.ledgerEntries);
                setTotalDebit(data.totalDebit);
                setTotalCredit(data.totalCredit);
                setClosingBalance(data.closingBalance);
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error fetching ledger data:', error);
            alert('Error fetching ledger data.');
        }
    };

    return (
        <Row>
            <Col lg="12">
                <Card>
                    <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#343a40', color: 'white' }}>
                        <i className="bi bi-journal-bookmark-fill"></i> Ledger
                    </CardTitle>
                    <CardBody>
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="party">Party Name</Label>
                                    <Accounts onNameChange={handleNameChange} selectedName={selectedName} />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="startDate">Start Date</Label>
                                    <DatePicker
                                        showIcon
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        placeholderText=" Click to select a date"
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="endDate">End Date</Label>
                                    <DatePicker
                                        showIcon
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        placeholderText=" Click to select a date"
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={2} className="mt-3">
                                <Button className="mt-2" color="primary" onClick={fetchLedger}>
                                    Fetch Ledger
                                </Button>
                            </Col>
                        </Row>

                        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#1d7aa9', color: 'white' }}>
                            {selectedName.label ? selectedName.label : 'No Account Selected'}
                        </CardTitle>

                        {/* Ledger Table */}
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Qty, Category, Description</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ledgerData.length > 0 ? (
                                    ledgerData.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{format(new Date(entry.createdAt), 'dd/MM/yyyy')}</td>
                                            <td>{entry.description}</td>
                                            <td>{entry.debit}</td>
                                            <td>{entry.credit}</td>
                                            <td>{entry.balance}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No ledger entries found</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>

                        {/* Summary */}
                        <CardTitle tag="h6" className="border-bottom p-3 mb-0" style={{ backgroundColor: '#1d7aa9', color: 'white' }}>
                            <p className='mb-1'>
                                From: {startDate ? format(startDate, 'dd MMM yyyy') : 'N/A'} - To: {endDate ? format(endDate, 'dd MMM yyyy') : 'N/A'} |
                                Total Amount Debited = {totalDebit} Rs | Total Amount Credited = {totalCredit} Rs
                            </p>
                            <p className='mb-0 text-end'>Closing Balance = {closingBalance} Rs</p>
                        </CardTitle>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
};

export default Ledger;
